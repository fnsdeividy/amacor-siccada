def verificar_cnt(cnt):
    print('acessando modulo verifix')
    if len(cnt)!=7:
        erro= 'tamanho do contrato diferente do padrão, por favor verifique o contrato digitado'
        return erro
    if len(cnt)== 7:
        return cnt
