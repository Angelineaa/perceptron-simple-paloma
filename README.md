# Caso 1: Perceptrón simple

Simulación didáctica de un perceptrón simple que aprende a clasificar si una paloma obtiene comida según el estado de dos pulsadores y la dirección del picoteo.

## Ejecutar

No se necesitan paquetes para abrir la aplicación. Abre `index.html` en un navegador moderno. La fuente Lora se descarga de Google Fonts; si no hay conexión, el navegador usa una fuente serif de reserva.

Para ejecutar las pruebas del modelo se necesita Node.js:

```powershell
node perceptronModel.test.js
```

## Variables y salidas

Las tres entradas usan codificación bipolar:

- `x1`: pulsador izquierdo, `+1` encendido y `-1` apagado.
- `x2`: pulsador derecho, `+1` encendido y `-1` apagado.
- `x3`: picoteo, `+1` hacia la izquierda y `-1` hacia la derecha.
- `yd`: salida deseada, `+1` si come y `-1` si no come.
- `y`: salida calculada por el perceptrón.

La regla del caso es que la paloma come salvo cuando ambos pulsadores están apagados y picotea a la izquierda. Por eso hay ocho patrones fijos y solo uno tiene salida deseada `-1`.

## Modelo

El perceptrón calcula la suma ponderada más el sesgo:

```text
z = w1*x1 + w2*x2 + w3*x3 + b
```

La función de activación devuelve `+1` cuando `z >= 0`; en otro caso devuelve `-1`. Si la predicción no coincide con `yd`, se actualizan los parámetros con la tasa `eta = 0.25`:

```text
wi = wi + eta * yd * xi
b  = b  + eta * yd
```

El botón **Paso a paso** procesa un patrón por pulsación. **Entrenar** recorre los ocho patrones por época y se detiene al clasificar todos correctamente o al alcanzar el límite de 25 épocas. La gráfica registra el número de errores al terminar cada época.

## Archivos

- `index.html`: estructura de la interfaz, controles, diagrama SVG y paisaje del encabezado.
- `styles.css`: paleta, distribución, tipografía Lora y adaptación a pantallas pequeñas.
- `script.js`: interacción de la página, visualización, entrenamiento, gráfica y guardado local.
- `perceptronModel.js`: regla de salida deseada, predicción, actualización y generación de patrones.
- `perceptronModel.test.js`: pruebas automáticas del conjunto de patrones y del cálculo del modelo.
- `pigeon-mark.png`: silueta transparente usada en el encabezado.

El estado de aprendizaje se guarda en el almacenamiento local del navegador bajo la clave `paloma_perceptron_state_v2`. El botón **Reiniciar** elimina ese estado y genera nuevos pesos iniciales.
