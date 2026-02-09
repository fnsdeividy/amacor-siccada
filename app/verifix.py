def verificar_cnt(cnt):
    print('acessando modulo verifix')
    if len(cnt)!=7:
        erro= 'tamanho do contrato diferente do padrão, por favor verifique o contrato digitado'
        return erro
    if len(cnt)== 7:
        return cnt

import math

def calcular_distancia_metros(lat1, lon1, lat2, lon2):
    """
    Calcula distância em metros entre duas coordenadas usando fórmula de Haversine
    
    Args:
        lat1, lon1: Primeira coordenada (graus decimais)
        lat2, lon2: Segunda coordenada (graus decimais)
    
    Returns:
        float: Distância em metros
    """
    try:
        # Converter strings para floats
        lat1 = float(lat1)
        lon1 = float(lon1)
        lat2 = float(lat2)
        lon2 = float(lon2)
        
        # Raio da Terra em metros
        R = 6371000
        
        # Converter graus para radianos
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Diferenças
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        # Fórmula de Haversine
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        # Distância em metros
        distancia = R * c
        
        return distancia
        
    except (ValueError, TypeError) as e:
        print(f"❌ Erro ao calcular distância: {e}")
        return None

def verificar_long_lat_comp(id_amatiss, user_token, raio_maximo=100):
    """
    Verifica se o usuário está dentro do raio permitido da clínica
    
    Args:
        id_amatiss: ID da clínica
        user_token: Token do usuário
        raio_maximo: Raio máximo em metros (padrão: 50m)
    
    Returns:
        dict: Resultado da verificação
    """
    from .models.database import get_loc_clinica, get_geoloc_by_token
    
    try:
        print(f"🔍 Iniciando verificação para clínica {id_amatiss}, token {user_token}")
        
        # 1. Obter geolocalização da clínica
        clinica_geoloc = get_loc_clinica(id_amatiss)
        
        if not clinica_geoloc:
            return {
                'autorizado': False,
                'mensagem': '❌ Clínica não encontrada ou sem geolocalização cadastrada',
                'erro': 'clinica_nao_encontrada'
            }
        
        # 2. Obter geolocalização do usuário
        user_geoloc = get_geoloc_by_token(user_token)
        
        if not user_geoloc:
            return {
                'autorizado': False,
                'mensagem': '❌ Geolocalização do usuário não encontrada',
                'erro': 'usuario_sem_geoloc'
            }
        
        print(f"📍 Geoloc clínica: {clinica_geoloc}")
        print(f"📍 Geoloc usuário: {user_geoloc}")
        
        # 3. Extrair coordenadas (ajustar nomes das chaves se necessário)
        # Da sua print, parece que as chaves são:
        # clinica_geoloc: {'latitude': '-22.906769', 'logitude': '-43.562717'}
        # user_geoloc: {'latitude_usuario': '-22.91558562073714', 'longitude_usuario': '-43.19271958161322'}
        
        # Para clínica - note que tem typo 'logitude' em vez de 'longitude'
        lat_clinica = clinica_geoloc.get('latitude')
        lon_clinica = clinica_geoloc.get('longitude') or clinica_geoloc.get('logitude')  # Usar 'logitude' se existir
        
        if not lat_clinica or not lon_clinica:
            return {
                'autorizado': False,
                'mensagem': '❌ Coordenadas da clínica incompletas',
                'clinica_data': clinica_geoloc
            }
        
        # Para usuário
        lat_usuario = user_geoloc.get('latitude_usuario') or user_geoloc.get('latitude')
        lon_usuario = user_geoloc.get('longitude_usuario') or user_geoloc.get('longitude')
        
        if not lat_usuario or not lon_usuario:
            return {
                'autorizado': False,
                'mensagem': '❌ Coordenadas do usuário incompletas',
                'usuario_data': user_geoloc
            }
        
        print(f"📐 Coordenadas extraídas:")
        print(f"   Clínica: {lat_clinica}, {lon_clinica}")
        print(f"   Usuário: {lat_usuario}, {lon_usuario}")
        
        # 4. Calcular distância
        distancia = calcular_distancia_metros(
            lat_clinica, lon_clinica,
            lat_usuario, lon_usuario
        )
        
        if distancia is None:
            return {
                'autorizado': False,
                'mensagem': '❌ Erro ao calcular distância',
                'erro': 'calculo_falhou'
            }
        
        print(f"📏 Distância calculada: {distancia:.2f} metros")
        print(f"🎯 Raio máximo permitido: {raio_maximo} metros")
        
        # 5. Verificar se está dentro do raio
        dentro_raio = distancia <= raio_maximo
        
        # 6. Preparar resposta
        if dentro_raio:
            return {
                'autorizado': True,
                'distancia_metros': round(distancia, 2),
                'raio_maximo': raio_maximo,
                'mensagem': f'✅ Autorizado! Distância: {distancia:.1f}m (limite: {raio_maximo}m)',
                'coordenadas_clinica': {'latitude': lat_clinica, 'longitude': lon_clinica},
                'coordenadas_usuario': {'latitude': lat_usuario, 'longitude': lon_usuario}
            }
        else:
            return {
                'autorizado': False,
                'distancia_metros': round(distancia, 2),
                'raio_maximo': raio_maximo,
                'mensagem': f'❌ Não autorizado! Distância: {distancia:.1f}m (limite: {raio_maximo}m)',
                'coordenadas_clinica': {'latitude': lat_clinica, 'longitude': lon_clinica},
                'coordenadas_usuario': {'latitude': lat_usuario, 'longitude': lon_usuario}
            }
            
    except Exception as e:
        print(f"❌ Erro em verificar_long_lat_comp: {e}")
        import traceback
        traceback.print_exc()
        return {
            'autorizado': False,
            'mensagem': f'❌ Erro na verificação de geolocalização: {str(e)}',
            'erro': 'excecao'
        }

# Versão alternativa mais simples
def verificar_long_lat_comp_simples(id_amatiss, user_token):
    """
    Versão simplificada - retorna True/False apenas
    """
    resultado = verificar_long_lat_comp(id_amatiss, user_token, raio_maximo=50)
    return resultado.get('autorizado', False)