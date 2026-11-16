import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, FlatList, ActivityIndicator,
  Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ====================== Configuración ======================
const API_URL = 'https://bosquesur-api.onrender.com/api';

// ====================== Tema forestal ======================
const colors = {
  verde900: '#1b3b2a', verde700: '#2e6b4a', verde600: '#3a855c', verde100: '#e4f1ea',
  madera500: '#a9763f', fondo: '#f6f8f5', superficie: '#ffffff', borde: '#d7e0d8',
  texto: '#1f2a24', textoSuave: '#5c6b61', rojo: '#b3261e', rojo100: '#fbe9e8', blanco: '#ffffff',
};

// ====================== Cliente API (token en memoria) ======================
let authToken = null;

class ApiError extends Error {
  constructor(message, code, status) { super(message); this.code = code; this.status = status; }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;
  let res;
  try {
    res = await fetch(API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión a internet.', 'NETWORK', 0);
  }
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(err.message ?? 'Ocurrió un error', err.code ?? 'ERROR', res.status);
  }
  return data;
}

const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),
  getPredios: () => request('/predios'),
  createPredio: (payload) => request('/predios', { method: 'POST', body: payload }),
  getCosechas: () => request('/cosechas'),
  getCosecha: (id) => request(`/cosechas/${id}`),
  createCosecha: (payload) => request('/cosechas', { method: 'POST', body: payload }),
};

// ====================== Auth Context ======================
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    authToken = res.data.token;
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => { authToken = null; setUser(null); }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuera de AuthProvider');
  return ctx;
}

// ====================== Componentes UI ======================
function Boton({ title, onPress, variant = 'primary', disabled, loading }) {
  const bg = variant === 'primary' ? colors.verde700 : variant === 'secondary' ? colors.verde100 : 'transparent';
  const fg = variant === 'primary' ? colors.blanco : colors.verde900;
  return (
    <Pressable onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [ui.boton, { backgroundColor: bg, opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.borde }]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[ui.botonTexto, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

function Campo({ label, value, onChangeText, ...props }) {
  return (
    <View style={ui.campo}>
      <Text style={ui.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={ui.input} placeholderTextColor={colors.textoSuave} {...props} />
    </View>
  );
}

function Cargando({ texto = 'Cargando...' }) {
  return <View style={ui.centro}><ActivityIndicator size="large" color={colors.verde600} /><Text style={ui.suave}>{texto}</Text></View>;
}

function MensajeError({ error }) {
  if (!error) return null;
  return <View style={ui.errorBox}><Text style={ui.errorText}>{error.message}</Text></View>;
}

// ====================== Pantallas ======================
function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const onLogin = async () => {
    setError(null); setCargando(true);
    try { await login(email.trim(), password); } catch (err) { setError(err); } finally { setCargando(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={ui.loginWrap}>
        <Text style={ui.logo}>🌲</Text>
        <Text style={ui.titulo}>BosqueSur Terreno</Text>
        <Text style={ui.sub}>Registro de predios y cosechas</Text>
        <MensajeError error={error} />
        <Campo label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="terreno@bosquesur.cl" />
        <Campo label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <Boton title="Iniciar sesión" onPress={onLogin} loading={cargando} />
        <View style={ui.demo}>
          <Text style={ui.demoText}>Demo (rol TERRENO):</Text>
          <Text style={ui.demoText}>terreno@bosquesur.cl / Terreno123*</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  return (
    <View style={ui.screen}>
      <Text style={ui.saludo}>Hola, {user?.nombre?.split(' ')[0]}</Text>
      <Text style={ui.suave}>Rol: {user?.role}</Text>
      <View style={{ marginTop: 20 }}>
        <Boton title="📋 Predios" onPress={() => navigation.navigate('Predios')} />
        <Boton title="🌳 Cosechas" onPress={() => navigation.navigate('Cosechas')} />
      </View>
      <View style={{ flex: 1 }} />
      <Boton title="Cerrar sesión" variant="secondary" onPress={logout} />
    </View>
  );
}

function PrediosScreen({ navigation }) {
  const [predios, setPredios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true); setError(null);
    api.getPredios().then((r) => setPredios(r.data.predios)).catch(setError).finally(() => setCargando(false));
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', cargar); return unsub; }, [navigation, cargar]);

  if (cargando) return <Cargando texto="Cargando predios..." />;
  return (
    <View style={ui.screen}>
      <Boton title="+ Nuevo predio" onPress={() => navigation.navigate('PredioForm')} />
      <MensajeError error={error} />
      <FlatList data={predios} keyExtractor={(p) => p.id}
        ListEmptyComponent={<Text style={ui.vacio}>No hay predios registrados.</Text>}
        renderItem={({ item }) => (
          <View style={ui.item}>
            <Text style={ui.itemTitulo}>{item.nombre}</Text>
            <Text style={ui.suave}>{item.ubicacion}</Text>
            {item.descripcion ? <Text style={ui.itemDesc}>{item.descripcion}</Text> : null}
          </View>
        )} />
    </View>
  );
}

function PredioFormScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setError(null);
    if (!nombre.trim() || !ubicacion.trim()) return setError({ message: 'El nombre y la ubicación son obligatorios.' });
    setGuardando(true);
    try {
      await api.createPredio({ nombre: nombre.trim(), ubicacion: ubicacion.trim(), descripcion: descripcion.trim() || undefined });
      Alert.alert('Predio creado', 'El predio se registró correctamente.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) { setError(err); } finally { setGuardando(false); }
  };

  return (
    <ScrollView contentContainerStyle={ui.formWrap}>
      <MensajeError error={error} />
      <Campo label="Nombre *" value={nombre} onChangeText={setNombre} placeholder="Fundo El Pinar" />
      <Campo label="Ubicación o comuna *" value={ubicacion} onChangeText={setUbicacion} placeholder="San Clemente, Maule" />
      <Campo label="Descripción (opcional)" value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} />
      <Boton title="Guardar predio" onPress={guardar} loading={guardando} />
    </ScrollView>
  );
}

function CosechasScreen({ navigation }) {
  const [cosechas, setCosechas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true); setError(null);
    api.getCosechas().then((r) => setCosechas(r.data.cosechas)).catch(setError).finally(() => setCargando(false));
  }, []);

  useEffect(() => { const unsub = navigation.addListener('focus', cargar); return unsub; }, [navigation, cargar]);

  if (cargando) return <Cargando texto="Cargando cosechas..." />;
  return (
    <View style={ui.screen}>
      <Boton title="+ Nueva cosecha" onPress={() => navigation.navigate('CosechaForm')} />
      <MensajeError error={error} />
      <FlatList data={cosechas} keyExtractor={(c) => c.id}
        ListEmptyComponent={<Text style={ui.vacio}>No hay cosechas registradas.</Text>}
        renderItem={({ item }) => (
          <Pressable style={ui.item} onPress={() => navigation.navigate('CosechaDetail', { id: item.id })}>
            <View style={ui.rowBetween}>
              <Text style={ui.itemTitulo}>{item.especie}</Text>
              <Text style={ui.vol}>{Number(item.volumenM3)} m³</Text>
            </View>
            <Text style={ui.suave}>{item.predio?.nombre} · {item.fecha ? new Date(item.fecha).toLocaleDateString('es-CL') : ''}</Text>
          </Pressable>
        )} />
    </View>
  );
}

function CosechaFormScreen({ navigation }) {
  const { user } = useAuth();
  const [predios, setPredios] = useState([]);
  const [cargandoPredios, setCargandoPredios] = useState(true);
  const [predioId, setPredioId] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [especie, setEspecie] = useState('');
  const [volumen, setVolumen] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api.getPredios().then((r) => setPredios(r.data.predios)).catch(setError).finally(() => setCargandoPredios(false));
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
      await api.createCosecha({ predioId, fecha, especie: especie.trim(), volumenM3: vol, observacion: observacion.trim() || undefined });
      Alert.alert('Cosecha registrada', 'La cosecha se registró correctamente.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) { setError(err); } finally { setGuardando(false); }
  };

  if (cargandoPredios) return <Cargando texto="Cargando predios..." />;
  return (
    <ScrollView contentContainerStyle={ui.formWrap}>
      <MensajeError error={error} />
      <Text style={ui.label}>Predio *</Text>
      <View style={ui.chips}>
        {predios.length === 0 && <Text style={ui.suave}>No hay predios. Crea uno primero.</Text>}
        {predios.map((p) => (
          <Pressable key={p.id} onPress={() => setPredioId(p.id)} style={[ui.chip, predioId === p.id && ui.chipSel]}>
            <Text style={[ui.chipText, predioId === p.id && ui.chipTextSel]}>{p.nombre}</Text>
          </Pressable>
        ))}
      </View>
      <Campo label="Fecha (AAAA-MM-DD) *" value={fecha} onChangeText={setFecha} placeholder="2026-11-16" />
      <Text style={ui.suave}>Responsable: {user?.nombre}</Text>
      <Campo label="Especie *" value={especie} onChangeText={setEspecie} placeholder="Pino, Eucalipto, Roble..." />
      <Campo label="Volumen (m³) *" value={volumen} onChangeText={setVolumen} keyboardType="decimal-pad" placeholder="120.5" />
      <Campo label="Observación (opcional)" value={observacion} onChangeText={setObservacion} multiline numberOfLines={3} />
      <Boton title="Guardar cosecha" onPress={guardar} loading={guardando} />
    </ScrollView>
  );
}

function CosechaDetailScreen({ route }) {
  const { id } = route.params;
  const [cosecha, setCosecha] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getCosecha(id).then((r) => setCosecha(r.data.cosecha)).catch(setError).finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <Cargando />;
  if (error) return <View style={ui.screen}><MensajeError error={error} /></View>;
  if (!cosecha) return null;

  const Fila = ({ label, value }) => (
    <View style={ui.fila}><Text style={ui.suave}>{label}</Text><Text style={ui.filaValue}>{value}</Text></View>
  );

  return (
    <ScrollView contentContainerStyle={ui.formWrap}>
      <Text style={ui.titulo}>{cosecha.especie}</Text>
      <View style={ui.card}>
        <Text style={ui.cardTitle}>Origen</Text>
        <Fila label="Predio" value={cosecha.predio?.nombre} />
        <Fila label="Ubicación" value={cosecha.predio?.ubicacion} />
      </View>
      <View style={ui.card}>
        <Text style={ui.cardTitle}>Datos de la cosecha</Text>
        <Fila label="Responsable" value={cosecha.responsable?.nombre} />
        <Fila label="Especie" value={cosecha.especie} />
        <Fila label="Fecha" value={cosecha.fecha ? new Date(cosecha.fecha).toLocaleDateString('es-CL') : '—'} />
        <Fila label="Volumen" value={`${Number(cosecha.volumenM3)} m³`} />
        <Fila label="Observación" value={cosecha.observacion || '—'} />
      </View>
    </ScrollView>
  );
}

// ====================== Navegación ======================
const Stack = createNativeStackNavigator();
const screenOptions = {
  headerStyle: { backgroundColor: colors.verde900 },
  headerTintColor: '#ffffff',
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.fondo },
};

function Navegacion() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'BosqueSur Terreno' }} />
          <Stack.Screen name="Predios" component={PrediosScreen} options={{ title: 'Predios' }} />
          <Stack.Screen name="PredioForm" component={PredioFormScreen} options={{ title: 'Nuevo predio' }} />
          <Stack.Screen name="Cosechas" component={CosechasScreen} options={{ title: 'Cosechas' }} />
          <Stack.Screen name="CosechaForm" component={CosechaFormScreen} options={{ title: 'Nueva cosecha' }} />
          <Stack.Screen name="CosechaDetail" component={CosechaDetailScreen} options={{ title: 'Detalle de cosecha' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navegacion />
      </NavigationContainer>
    </AuthProvider>
  );
}

// ====================== Estilos ======================
const ui = StyleSheet.create({
  boton: { paddingVertical: 15, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  botonTexto: { fontSize: 16, fontWeight: '700' },
  campo: { marginBottom: 14 },
  label: { fontWeight: '600', color: colors.verde900, marginBottom: 6, fontSize: 14 },
  input: { borderWidth: 1, borderColor: colors.borde, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, backgroundColor: colors.blanco, color: colors.texto },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.fondo },
  suave: { color: colors.textoSuave },
  errorBox: { backgroundColor: colors.rojo100, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: colors.rojo, fontSize: 14 },
  loginWrap: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.fondo },
  logo: { fontSize: 56, textAlign: 'center' },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.verde900, textAlign: 'center', marginTop: 8 },
  sub: { textAlign: 'center', color: colors.textoSuave, marginBottom: 24 },
  demo: { marginTop: 24, backgroundColor: colors.verde100, borderRadius: 8, padding: 12 },
  demoText: { color: colors.verde900, fontSize: 13, textAlign: 'center' },
  screen: { flex: 1, padding: 16, backgroundColor: colors.fondo },
  saludo: { fontSize: 24, fontWeight: '800', color: colors.verde900, marginTop: 8 },
  formWrap: { padding: 18, backgroundColor: colors.fondo, flexGrow: 1 },
  item: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 10, padding: 14, marginVertical: 5 },
  itemTitulo: { fontSize: 16, fontWeight: '700', color: colors.verde900 },
  itemDesc: { color: colors.texto, marginTop: 6, fontSize: 13 },
  vacio: { textAlign: 'center', color: colors.textoSuave, marginTop: 30 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vol: { fontSize: 15, fontWeight: '700', color: colors.madera500 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  chip: { borderWidth: 1, borderColor: colors.borde, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8, backgroundColor: colors.superficie },
  chipSel: { backgroundColor: colors.verde600, borderColor: colors.verde600 },
  chipText: { color: colors.verde900 },
  chipTextSel: { color: colors.blanco, fontWeight: '700' },
  card: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde, borderRadius: 10, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.madera500, textTransform: 'uppercase', marginBottom: 8 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.borde },
  filaValue: { color: colors.texto, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});
