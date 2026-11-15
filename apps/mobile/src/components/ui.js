import { ActivityIndicator, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';

export function Boton({ title, onPress, variant = 'primary', disabled, loading }) {
  const bg = variant === 'primary' ? colors.verde700 : variant === 'secondary' ? colors.verde100 : 'transparent';
  const fg = variant === 'primary' ? colors.blanco : colors.verde900;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: bg, opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.borde },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.botonTexto, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Campo({ label, value, onChangeText, ...props }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor={colors.textoSuave}
        {...props}
      />
    </View>
  );
}

export function Cargando({ texto = 'Cargando...' }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colors.verde600} />
      <Text style={styles.suave}>{texto}</Text>
    </View>
  );
}

export function MensajeError({ error }) {
  if (!error) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{error.message}</Text>
    </View>
  );
}

export function MensajeOk({ texto }) {
  if (!texto) return null;
  return (
    <View style={styles.okBox}>
      <Text style={styles.okText}>{texto}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  boton: { paddingVertical: 15, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  botonTexto: { fontSize: 16, fontWeight: '700' },
  campo: { marginBottom: 14 },
  label: { fontWeight: '600', color: colors.verde900, marginBottom: 6, fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: colors.borde, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12,
    fontSize: 16, backgroundColor: colors.blanco, color: colors.texto,
  },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  suave: { color: colors.textoSuave, marginTop: 10 },
  errorBox: { backgroundColor: colors.rojo100, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: colors.rojo, fontSize: 14 },
  okBox: { backgroundColor: colors.verde100, borderRadius: 8, padding: 12, marginBottom: 12 },
  okText: { color: colors.verde700, fontSize: 14 },
});
