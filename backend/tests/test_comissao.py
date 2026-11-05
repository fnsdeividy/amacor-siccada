"""Cálculo de comissão contra a planilha "COMISSÃO DE CORRETORAS_MH VIDA.xlsx".

    docker-compose run --rm backend python -m unittest discover -s tests
"""
import unittest
from datetime import date

from app.comissao import calcular, descrever_regra, fatores, parse_data, rotulo_mes

V, A = 'venda', 'anterior'

# aba MARCELO ROSA: E = 100% da venda, F = 30% de E, G = 3% de F; antes de
# abr/26 só a 1ª parcela (aba MARCELO ROSA 1 CONTRATO)
REGRAS_MARCELO = [
    {'vigencia': '2025-01', 'parcelas': [{'percentual': 100, 'base': V}], 'valor_fixo': 0},
    {'vigencia': '2026-04', 'parcelas': [{'percentual': 100, 'base': V},
                                         {'percentual': 30, 'base': A},
                                         {'percentual': 3, 'base': A}], 'valor_fixo': 0},
]
VENDAS_MARCELO = {  # valor da venda por mês, como na planilha
    '2026-03': 1100.45, '2026-04': 957.76, '2026-05': 103.35, '2026-06': 357.11,
    '2026-07': 1704.00, '2026-08': 1204.68, '2026-09': 882.64, '2026-10': 1479.86,
}


def venda(mes, valor, **extra):
    v = {'numero_proposta': f'P{mes}', 'data_venda': f'{mes}-10', 'valor_venda': valor,
         'status': 'contrato finalizado', 'numero_contrato': f'C{mes}'}
    v.update(extra)
    return v


class PlanilhaMarcelo(unittest.TestCase):
    def setUp(self):
        vendas = [venda(m, v) for m, v in VENDAS_MARCELO.items()]
        self.calc = calcular(vendas, REGRAS_MARCELO, {}, '2026-11')

    def test_valor_a_pagar_por_mes(self):
        # coluna VALOR PAGO da planilha (e o "A PAGAR" de nov/26)
        esperado = {
            '2026-04': 1100.45, '2026-05': 957.76, '2026-06': 390.68, '2026-07': 396.73,
            '2026-08': 1812.06, '2026-09': 1719.09, '2026-10': 1259.38, '2026-11': 1755.49,
        }
        for mes, valor in esperado.items():
            self.assertAlmostEqual(self.calc['a_pagar'][mes], valor, places=2, msg=mes)

    def test_parcelas_da_linha(self):
        abr = self.calc['por_mes_venda']['2026-04']
        self.assertEqual(abr['parcelas'], [957.76, 287.33, 8.62])
        ago = self.calc['por_mes_venda']['2026-08']
        self.assertEqual(ago['parcelas'], [1204.68, 361.40, 10.84])

    def test_antes_de_abril_so_a_primeira(self):
        mar = self.calc['por_mes_venda']['2026-03']
        self.assertEqual(mar['parcelas'], [1100.45, 0.0, 0.0])


class Regras(unittest.TestCase):
    def test_encadeado_e_sobre_a_venda(self):
        self.assertEqual([round(f, 4) for f in fatores(REGRAS_MARCELO[1]['parcelas'])], [1, 0.3, 0.009])
        unix = [{'percentual': 100, 'base': V}, {'percentual': 50, 'base': V}, {'percentual': 3, 'base': V}]
        self.assertEqual(fatores(unix), [1, 0.5, 0.03])

    def test_valor_fixo_mensal(self):
        # aba MICHELE: 50% / 25% / 3% da venda + R$ 1.000 nos três primeiros meses
        regras = [
            {'vigencia': '2026-07', 'valor_fixo': 1000, 'parcelas': [
                {'percentual': 50, 'base': V}, {'percentual': 25, 'base': V}, {'percentual': 3, 'base': V}]},
            {'vigencia': '2026-10', 'valor_fixo': 0, 'parcelas': [
                {'percentual': 100, 'base': V}, {'percentual': 50, 'base': V}, {'percentual': 3, 'base': V}]},
        ]
        calc = calcular([venda('2026-07', 200.0)], regras, {}, '2026-11')
        self.assertEqual(calc['a_pagar']['2026-08'], 1100.0)   # 50% + fixo
        self.assertEqual(calc['a_pagar']['2026-09'], 1050.0)   # 25% + fixo
        self.assertEqual(calc['a_pagar']['2026-10'], 1006.0)   # 3% + fixo
        self.assertEqual(calc['a_pagar'].get('2026-11', 0.0), 0.0)  # outubro já sem fixo

    def test_descricao(self):
        self.assertEqual(descrever_regra(REGRAS_MARCELO[1]),
                         '100% da venda · 30% da 1ª parcela · 3% da 2ª parcela')


class Cancelamento(unittest.TestCase):
    REGRA = [REGRAS_MARCELO[1]]

    def test_venda_cancelada_antes_do_pagamento_nao_gera_nada(self):
        v = venda('2026-08', 100.0, status='venda cancelada', data_att_fase='2026-08-13')
        calc = calcular([v], self.REGRA, {}, '2026-11')
        self.assertEqual(calc['a_pagar'], {'2026-09': 0.0, '2026-10': 0.0, '2026-11': 0.0})

    def test_contrato_excluido_para_as_parcelas_seguintes(self):
        # venda em mai, contrato excluído em 21/07: paga jun (100%) e jul (30%), não ago (3%)
        v = venda('2026-05', 100.0, numero_contrato='A021214')
        calc = calcular([v], self.REGRA, {'A021214': date(2026, 7, 21)}, '2026-11')
        self.assertEqual(calc['a_pagar']['2026-06'], 100.0)
        self.assertEqual(calc['a_pagar']['2026-07'], 30.0)
        self.assertEqual(calc['a_pagar']['2026-08'], 0.0)

    def test_data_invalida_fica_de_fora(self):
        calc = calcular([venda('2026-05', 1.0, data_venda='20025-07-11')], self.REGRA, {}, '2026-11')
        self.assertEqual(len(calc['invalidas']), 1)
        self.assertEqual(calc['a_pagar'], {})


class Datas(unittest.TestCase):
    def test_formatos(self):
        self.assertEqual(parse_data('2026-04-02'), date(2026, 4, 2))
        self.assertEqual(parse_data('30/06/2025'), date(2025, 6, 30))
        self.assertEqual(parse_data('02-04-2026'), date(2026, 4, 2))
        self.assertIsNone(parse_data('20025-07-11'))
        self.assertIsNone(parse_data(''))
        self.assertEqual(rotulo_mes('2026-04'), 'abr/26')


if __name__ == '__main__':
    unittest.main()
