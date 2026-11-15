import { useState } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import { api } from '../api/client.js';
import { Boton, Campo, MensajeError } from '../components/ui.js';
import { colors } from '../theme/colors.js';

export default function PredioFormScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setError(null);
    if (!nombre.trim() || !ubicacion.trim()) {
      setError({ message: 'El nombre y la ubicación son obligatorios.' });
      return;
    }
    setGuardando(true);
    try {
      await api.createPredio({ nombre: nombre.trim(), ubicacion: ubicacion.trim(), descripcion: descripcion.trim() || undefined });
      Alert.alert('Predio creado', 'El predio se registró correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <MensajeError error={error} />
      <Campo label="Nombre *" value={nombre} onChangeText={setNombre} placeholder="Fundo El Pinar" />
      <Campo label="Ubicación o comuna *" value={ubicacion} onChangeText={setUbicacion} placeholder="San Clemente, Maule" />
      <Campo label="Descripción (opcional)" value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} />
      <Boton title="Guardar predio" onPress={guardar} loading={guardando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, backgroundColor: colors.fondo, flexGrow: 1 },
});
