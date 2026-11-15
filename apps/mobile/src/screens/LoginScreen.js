import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import { Boton, Campo, MensajeError } from '../components/ui.js';
import { colors } from '../theme/colors.js';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const onLogin = async () => {
    setError(null);
    setCargando(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.logo}>🌲</Text>
        <Text style={styles.titulo}>BosqueSur Terreno</Text>
        <Text style={styles.sub}>Registro de predios y cosechas</Text>

        <MensajeError error={error} />
        <Campo label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="terreno@bosquesur.cl" />
        <Campo label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <Boton title="Iniciar sesión" onPress={onLogin} loading={cargando} />

        <View style={styles.demo}>
          <Text style={styles.demoText}>Demo (rol TERRENO):</Text>
          <Text style={styles.demoText}>terreno@bosquesur.cl / Terreno123*</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.fondo },
  logo: { fontSize: 56, textAlign: 'center' },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.verde900, textAlign: 'center', marginTop: 8 },
  sub: { textAlign: 'center', color: colors.textoSuave, marginBottom: 24 },
  demo: { marginTop: 24, backgroundColor: colors.verde100, borderRadius: 8, padding: 12 },
  demoText: { color: colors.verde900, fontSize: 13, textAlign: 'center' },
});
