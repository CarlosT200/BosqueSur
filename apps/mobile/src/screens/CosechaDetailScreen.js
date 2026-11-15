import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { api } from '../api/client.js';
import { Cargando, MensajeError } from '../components/ui.js';
import { colors } from '../theme/colors.js';

const fmtFecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es-CL') : '—');

function Fila({ label, value }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function CosechaDetailScreen({ route }) {
  const { id } = route.params;
  const [cosecha, setCosecha] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getCosecha(id).then((res) => setCosecha(res.data.cosecha)).catch(setError).finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <Cargando />;
  if (error) return <View style={styles.wrap}><MensajeError error={error} /></View>;
  if (!cosecha) return null;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.titulo}>{cosecha.especie}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Origen</Text>
        <Fila label="Predio" value={cosecha.predio?.nombre} />
        <Fila label="Ubicación" value={cosecha.predio?.ubicacion} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos de la cosecha</Text>
        <Fila label="Responsable" value={cosecha.responsable?.nombre} />
        <Fila label="Especie" value={cosecha.especie} />
        <Fila label="Fecha" value={fmtFecha(cosecha.fecha)} />
        <Fila label="Volumen" value={`${Number(cosecha.volumenM3)} m³`} />
        <Fila label="Observación" value={cosecha.observacion || '—'} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, backgroundColor: colors.fondo, flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.verde900, marginBottom: 12 },
  card: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 10, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.madera500, textTransform: 'uppercase', marginBottom: 8 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.borde },
  label: { color: colors.textoSuave },
  value: { color: colors.texto, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});
