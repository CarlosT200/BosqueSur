import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Boton, Campo, Cargando, MensajeError } from '../components/ui.js';
import { colors } from '../theme/colors.js';

const hoy = () => new Date().toISOString().slice(0, 10);

export default function CosechaFormScreen({ navigation }) {
  const { user } = useAuth();
  const [predios, setPredios] = useState([]);
  const [cargandoPredios, setCargandoPredios] = useState(true);

  const [predioId, setPredioId] = useState(null);
  const [fecha, setFecha] = useState(hoy());
  const [especie, setEspecie] = useState('');
  const [volumen, setVolumen] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api.getPredios().then((res) => setPredios(res.data.predios)).catch(setError).finally(() => setCargandoPredios(false));
  }, []);

  const guardar = async () => {
    setError(null);
    if (!predioId) return setError({ message: 'Debe seleccionar un predio.' });
    if (!especie.trim()) return setError({ message: 'La especie es obligatoria.' });
    const vol = Number(volumen);
    if (!volumen || isNaN(vol) || vol <= 0) return setError({ message: 'El volumen debe ser mayor que cero.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return setError({ message: 'La fecha debe tener formato AAAA-MM-DD.' });

    setGuardando(true);
    try {
      await api.createCosecha({
        predioId,
        fecha,
        especie: especie.trim(),
        volumenM3: vol,
        observacion: observacion.trim() || undefined,
      });
      Alert.alert('Cosecha registrada', 'La cosecha se registró correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoPredios) return <Cargando texto="Cargando predios..." />;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <MensajeError error={error} />

      <Text style={styles.label}>Predio *</Text>
      <View style={styles.chips}>
        {predios.length === 0 && <Text style={styles.suave}>No hay predios. Cree uno primero.</Text>}
        {predios.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setPredioId(p.id)}
            style={[styles.chip, predioId === p.id && styles.chipSel]}
          >
            <Text style={[styles.chipText, predioId === p.id && styles.chipTextSel]}>{p.nombre}</Text>
          </Pressable>
        ))}
      </View>

      <Campo label="Fecha (AAAA-MM-DD) *" value={fecha} onChangeText={setFecha} placeholder="2026-11-15" />
      <Text style={styles.suave}>Responsable: {user?.nombre}</Text>
      <Campo label="Especie *" value={especie} onChangeText={setEspecie} placeholder="Pino, Eucalipto, Roble..." />
      <Campo label="Volumen (m³) *" value={volumen} onChangeText={setVolumen} keyboardType="decimal-pad" placeholder="120.5" />
      <Campo label="Observación (opcional)" value={observacion} onChangeText={setObservacion} multiline numberOfLines={3} />

      <Boton title="Guardar cosecha" onPress={guardar} loading={guardando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, backgroundColor: colors.fondo, flexGrow: 1 },
  label: { fontWeight: '600', color: colors.verde900, marginBottom: 6, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  chip: { borderWidth: 1, borderColor: colors.borde, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8, backgroundColor: colors.superficie },
  chipSel: { backgroundColor: colors.verde600, borderColor: colors.verde600 },
  chipText: { color: colors.verde900 },
  chipTextSel: { color: colors.blanco, fontWeight: '700' },
  suave: { color: colors.textoSuave, marginBottom: 10 },
});
