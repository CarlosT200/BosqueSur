import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client.js';
import { Boton, Cargando, MensajeError } from '../components/ui.js';
import { colors } from '../theme/colors.js';

export default function PrediosScreen({ navigation }) {
  const [predios, setPredios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    api.getPredios().then((res) => setPredios(res.data.predios)).catch(setError).finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  if (cargando) return <Cargando texto="Cargando predios..." />;

  return (
    <View style={styles.wrap}>
      <Boton title="+ Nuevo predio" onPress={() => navigation.navigate('PredioForm')} />
      <MensajeError error={error} />
      <FlatList
        data={predios}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={<Text style={styles.vacio}>No hay predios registrados.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.sub}>{item.ubicacion}</Text>
            {item.descripcion ? <Text style={styles.desc}>{item.descripcion}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: colors.fondo },
  item: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 10, padding: 14, marginVertical: 5 },
  nombre: { fontSize: 16, fontWeight: '700', color: colors.verde900 },
  sub: { color: colors.textoSuave, marginTop: 2 },
  desc: { color: colors.texto, marginTop: 6, fontSize: 13 },
  vacio: { textAlign: 'center', color: colors.textoSuave, marginTop: 30 },
});
