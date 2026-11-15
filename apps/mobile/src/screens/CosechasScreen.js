import { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client.js';
import { Boton, Cargando, MensajeError } from '../components/ui.js';
import { colors } from '../theme/colors.js';

const fmtFecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es-CL') : '');

export default function CosechasScreen({ navigation }) {
  const [cosechas, setCosechas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    api.getCosechas().then((res) => setCosechas(res.data.cosechas)).catch(setError).finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  if (cargando) return <Cargando texto="Cargando cosechas..." />;

  return (
    <View style={styles.wrap}>
      <Boton title="+ Nueva cosecha" onPress={() => navigation.navigate('CosechaForm')} />
      <MensajeError error={error} />
      <FlatList
        data={cosechas}
        keyExtractor={(c) => c.id}
        ListEmptyComponent={<Text style={styles.vacio}>No hay cosechas registradas.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => navigation.navigate('CosechaDetail', { id: item.id })}>
            <View style={styles.rowBetween}>
              <Text style={styles.especie}>{item.especie}</Text>
              <Text style={styles.vol}>{Number(item.volumenM3)} m³</Text>
            </View>
            <Text style={styles.sub}>{item.predio?.nombre} · {fmtFecha(item.fecha)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: colors.fondo },
  item: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 10, padding: 14, marginVertical: 5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  especie: { fontSize: 16, fontWeight: '700', color: colors.verde900 },
  vol: { fontSize: 15, fontWeight: '700', color: colors.madera500 },
  sub: { color: colors.textoSuave, marginTop: 4 },
  vacio: { textAlign: 'center', color: colors.textoSuave, marginTop: 30 },
});
