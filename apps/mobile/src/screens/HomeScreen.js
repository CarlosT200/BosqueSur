import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import { Boton } from '../components/ui.js';
import { colors } from '../theme/colors.js';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  return (
    <View style={styles.wrap}>
      <Text style={styles.saludo}>Hola, {user?.nombre?.split(' ')[0]}</Text>
      <Text style={styles.rol}>Rol: {user?.role}</Text>

      <View style={{ marginTop: 20 }}>
        <Boton title="📋 Predios" onPress={() => navigation.navigate('Predios')} />
        <Boton title="🌳 Cosechas" onPress={() => navigation.navigate('Cosechas')} />
      </View>

      <View style={{ flex: 1 }} />
      <Boton title="Cerrar sesión" variant="secondary" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: colors.fondo },
  saludo: { fontSize: 24, fontWeight: '800', color: colors.verde900, marginTop: 8 },
  rol: { color: colors.textoSuave, marginTop: 4 },
});
