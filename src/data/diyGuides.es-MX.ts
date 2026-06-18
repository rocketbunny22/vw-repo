import type { DiyGuide } from '@/types';

type SpanishGuideContent = Pick<DiyGuide, 'title' | 'content' | 'tools' | 'parts'>;

export const spanishGuideContent: Record<string, SpanishGuideContent> = {
  'mk1-gti-carburetor-rebuild': {
    title: 'Guía para reconstruir el carburador del Mk1 GTI',
    content: `# Reconstrucción del carburador del Mk1 GTI

Esta guía explica el proceso completo para reconstruir el carburador original del GTI 8V.

## Herramientas necesarias
- Kit de reconstrucción del carburador
- Juego de desarmadores
- Llaves pequeñas
- Limpiador para carburador
- Aire comprimido

## Dificultad: Intermedia
- Tiempo estimado: 2 a 3 horas

## Pasos

### 1. Retira el carburador
1. Desconecta la terminal negativa de la batería
2. Retira la carcasa del filtro de aire
3. Desconecta las líneas de combustible
4. Desconecta el chicote del acelerador
5. Retira los tornillos de montaje

### 2. Desarma el carburador
1. Retira la cámara del flotador
2. Retira el flotador
3. Retira la bomba de aceleración
4. Retira las espreas y agujas

### 3. Limpia todas las piezas
Aplica limpiador para carburador en todos los conductos y sécalos con aire comprimido.

### 4. Instala el kit de reconstrucción
Reemplaza las juntas, agujas y sellos incluidos en el kit.

### 5. Vuelve a armar
Invierte los pasos de desmontaje y ajusta el nivel del flotador según la especificación correcta.

### 6. Primer arranque
Deja el motor en ralentí durante cinco minutos, revisa que no existan fugas y ajusta la mezcla según sea necesario.`,
    tools: ['Kit de reconstrucción', 'Juego de desarmadores', 'Juego de llaves', 'Limpiador para carburador', 'Aire comprimido'],
    parts: ['Kit de reconstrucción', 'Flotador', 'Bomba de aceleración'],
  },
  'mk4-gti-18t-turbo-replacement': {
    title: 'Reemplazo del turbo 1.8T del Mk4 GTI',
    content: `# Reemplazo del turbo 1.8T del Mk4 GTI

Guía completa para reemplazar el turbocargador K04 de un Mk4 GTI.

## Herramientas necesarias
- Juego de dados
- Torquímetro
- Pistola de calor
- Aceite penetrante
- Juntas nuevas para el turbo

## Dificultad: Difícil
- Tiempo estimado: 6 a 8 horas

## Pasos

### 1. Preparación
1. Desconecta la batería
2. Soporta el motor desde arriba
3. Retira las tuberías del intercooler
4. Retira el convertidor catalítico

### 2. Retira el turbo usado
1. Retira la línea de alimentación de aceite
2. Retira la línea de retorno de aceite
3. Retira las tuercas del múltiple de escape
4. Retira los tornillos del turbo
5. Baja el conjunto del turbocargador

### 3. Instala el turbo nuevo
1. Limpia las superficies de contacto
2. Instala juntas nuevas
3. Monta el turbocargador
4. Conecta nuevamente las líneas de aceite
5. Conecta el intercooler

### 4. Ceba el sistema de aceite
Antes de arrancar el motor, llena el turbo con aceite para evitar un arranque en seco.

### 5. Primera prueba
Déjalo en ralentí durante dos minutos y revisa cuidadosamente que no existan fugas.`,
    tools: ['Juego de dados', 'Torquímetro', 'Pistola de calor', 'Aceite penetrante', 'Juntas nuevas'],
    parts: ['Turbocargador K04', 'Juntas del turbo', 'Junta de alimentación de aceite', 'Tornillos de montaje'],
  },
  'mk1-golf-suspension-lowering': {
    title: 'Cómo bajar la suspensión de un Golf Mk1',
    content: `# Cómo bajar la suspensión de un Golf Mk1

Opciones y pasos generales para reducir la altura de un Golf Mk1 de forma controlada.

## Opciones
- Resortes deportivos
- Coilovers ajustables
- Copas y soportes compatibles

Evita cortar los resortes originales. Un resorte modificado de esa manera puede perder su asiento, alterar la tasa de suspensión y comprometer el control del vehículo.

## Dificultad: Intermedia
- Tiempo estimado: 2 a 4 horas

## Pasos

### 1. Suspensión delantera
1. Afloja los birlos con el vehículo en el piso
2. Levanta el frente y colócalo sobre torres
3. Retira las ruedas
4. Retira los conjuntos de amortiguador
5. Instala los resortes o coilovers siguiendo las instrucciones del fabricante
6. Aprieta toda la tornillería al torque especificado

### 2. Suspensión trasera
1. Levanta la parte trasera y colócala sobre torres
2. Soporta el eje trasero
3. Retira amortiguadores y resortes
4. Instala los componentes nuevos
5. Vuelve a armar y aprieta al torque correcto

### 3. Alineación
- Realiza una alineación después de modificar la altura
- Verifica caída, convergencia y espacio entre llanta y carrocería
- Revisa nuevamente la tornillería después de los primeros kilómetros`,
    tools: ['Gato hidráulico', 'Torres de soporte', 'Juego de dados', 'Torquímetro', 'Compresor de resortes'],
    parts: ['Resortes deportivos o coilovers', 'Soportes de amortiguador', 'Topes de suspensión'],
  },
  'type1-beetle-floor-pan-replacement': {
    title: 'Reemplazo de pisos del Volkswagen Tipo 1',
    content: `# Reemplazo de pisos del Volkswagen Tipo 1

Proceso general para reemplazar pisos oxidados en un Sedán Volkswagen o Vocho.

## Herramientas necesarias
- Soldadora MIG
- Taladro
- Esmeril
- Pinzas de presión
- Convertidor de óxido
- Equipo de protección personal

## Dificultad: Difícil
- Tiempo estimado: 20 a 30 horas

## Pasos

### 1. Retira el interior
1. Desconecta la batería
2. Retira asientos y alfombra
3. Retira los componentes sujetos al piso
4. Identifica y protege el cableado cercano

### 2. Retira el metal oxidado
1. Marca los puntos de soldadura originales
2. Perfora los puntos de soldadura
3. Corta el panel dañado
4. Limpia el metal restante y trata el óxido

### 3. Instala el piso nuevo
1. Presenta el panel y confirma su ajuste
2. Sujétalo con pinzas
3. Suelda por puntos siguiendo el patrón original
4. Limpia y sella todas las uniones

### 4. Protección final
Aplica primario, sellador de juntas y recubrimiento inferior compatible antes de reinstalar el interior.`,
    tools: ['Soldadora MIG', 'Taladro', 'Esmeril', 'Pinzas de presión', 'Equipo de protección'],
    parts: ['Piso izquierdo', 'Piso derecho', 'Sellador de juntas', 'Primario anticorrosivo'],
  },
  'mk2-gti-brake-upgrade': {
    title: 'Mejora de frenos para el Mk2 GTI',
    content: `# Mejora de frenos para el Mk2 GTI

Guía general para actualizar los frenos originales de un Mk2 GTI.

## Opciones
- Discos delanteros de mayor diámetro con balatas compatibles
- Conversión a cálipers de cuatro pistones
- Kit completo de frenos con líneas y soportes específicos

## Dificultad: Intermedia
- Tiempo estimado: 4 a 6 horas

## Discos y balatas
1. Levanta el vehículo y colócalo sobre torres
2. Retira las ruedas
3. Retira el cáliper y soporta la manguera sin tensarla
4. Retira el disco usado
5. Instala el disco y las balatas nuevas
6. Aprieta los componentes al torque indicado
7. Purga el sistema si se abrió el circuito hidráulico

## Kit de frenos grandes
1. Confirma compatibilidad entre manguetas, soportes, cálipers y ruedas
2. Retira el cáliper original
3. Instala el soporte y cáliper nuevos
4. Instala líneas compatibles
5. Purga completamente el sistema

## Recomendaciones
- Usa líquido DOT 4 nuevo de una marca reconocida
- Realiza el asentamiento de las balatas según el fabricante
- Revisa fugas y el nivel del depósito antes de conducir`,
    tools: ['Gato hidráulico', 'Torres de soporte', 'Juego de dados', 'Torquímetro', 'Equipo para purgar frenos'],
    parts: ['Discos compatibles', 'Balatas de alto desempeño', 'Líneas de freno', 'Soportes de cáliper'],
  },
  'mk3-vr6-timing-belt': {
    title: 'Inspección de cadenas de distribución del Mk3 VR6',
    content: `# Inspección de cadenas de distribución del Mk3 VR6

El motor VR6 utiliza cadenas de distribución, no una banda de distribución. Esta guía corrige la descripción anterior y presenta una inspección general.

## Advertencia
El servicio de cadenas del VR6 es un trabajo avanzado. La cadena principal se encuentra del lado de la transmisión y el procedimiento puede requerir retirar la transmisión.

## Señales de desgaste
- Ruido metálico al arrancar en frío
- Códigos de correlación entre cigüeñal y árboles de levas
- Ralentí irregular
- Valores de adaptación fuera de especificación

## Inspección inicial
1. Escucha el motor durante un arranque completamente en frío
2. Escanea todos los módulos y registra los códigos antes de borrarlos
3. Revisa los valores de sincronización con una herramienta compatible
4. Comprueba el historial de mantenimiento y el aceite utilizado
5. Consulta el manual de taller correspondiente al código exacto del motor

## Servicio
El reemplazo puede incluir cadenas, guías, tensores, sellos y tornillería de un solo uso. Confirma siempre los números de parte y torques para el código de motor específico.

No arranques el motor si existe ruido severo o evidencia de que la distribución saltó.`,
    tools: ['Escáner compatible con VW', 'Juego de dados', 'Torquímetro', 'Herramientas de sincronización VR6'],
    parts: ['Kit de cadenas', 'Guías', 'Tensores', 'Juntas y tornillería especificada'],
  },
};
