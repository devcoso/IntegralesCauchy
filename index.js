const inputFz = document.getElementById('fz')
const inputZ0 = document.getElementById('z0')
const inputNMas1 = document.getElementById('nMas1')
const inputCentroCirculo = document.getElementById('centroCirculo') 
const inputRadioCirculo = document.getElementById('radioCirculo') 
const boton = document.getElementById('boton')
const divErrores = document.getElementById('errores')
const pResultado = document.getElementById('resultado')
const grafico = document.getElementById('grafico')

boton.addEventListener('click', () => {
    const parser = math.parser()
    let n, fz, z0, z1, r, resultado
    let errores = []

    //Inicializando y revisisando errores
    try {
        //Crea la función f(z)
        parser.evaluate('f(z) = ' + inputFz.value)  
        fz = parser.get('f')
        console.log(fz(1))    
    } catch (e) {
       errores.push("Función f(z) no reconocida")
    }
    
    try {
        //Crea z0
        if(inputZ0.value == "") throw new Error
        z0 = parser.evaluate(inputZ0.value)
        console.log(z0)
    } catch {
        errores.push("z0 debe ser un numero complejo")
    }
    if( (Number(inputNMas1.value) % 1) === 0 && Number(inputNMas1.value) > 0 ){
        //Crea N
        n = Number(inputNMas1.value) - 1
    } else {
        errores.push("n+1 debe ser un entero positivo")
    }
    try {
        //Crea z1
        if(inputCentroCirculo.value == "") throw new Error
        z1 = parser.evaluate(inputCentroCirculo.value)
        console.log(z1)
    } catch {
        errores.push("z1 debe ser un numero complejo")
    }
    try {
        //Crea z1
        if(inputRadioCirculo.value == "") throw new Error
        r = parser.evaluate(inputRadioCirculo.value)
        console.log(r)
        if(r < 0) throw new Error
    } catch {
        errores.push("R debe ser un real positivo")
    }
    //Lógica para cuando no hay errores
    if(errores.length === 0){
        disZ1AZ0 = parser.evaluate(`abs(${z0} - ${z1})`)
        if(disZ1AZ0 < r) {
            //Obtener derivada n-décima
            let nDerivada = inputFz.value
            let nMenos1Derivada
            let nAux = n
            if(nAux >= 1){
                nDerivada =  math.derivative(inputFz.value, 'z').toString()
                nAux--
            }
            while( nAux > 0){
                nMenos1Derivada = nDerivada
                nDerivada = math.derivative(nMenos1Derivada, 'z').toString()
                nAux--
            }
            parser.evaluate('g(z) = ' + nDerivada)
            let fzNDerivada = parser.get('g')
            resultado = math.simplify(`((2 * pi * i) * (${fzNDerivada(z0).toString()})) / (${n}!) `)
            console.log("El resultado es : " + resultado.toString())
            console.log("El resultado real es : " + math.evaluate(`((2 * pi * i) * (${fzNDerivada(z0).toString()})) / (${n}!) `).toString())
        } else {
            resultado = 0
        }
        pResultado.innerHTML = `LA INTEGRAL DE CONTORNO EN C ES IGUAL A <span class="text-blue-500">${resultado}</span>`
        grafico.classList.remove('hidden')
        graficarContorno(math.re(z1), math.im(z1), r, math.re(z0), math.im(z0))
    } else {
        pResultado.innerHTML = ''
        grafico.classList.add('hidden')
    }
    mostrarErrores(errores)
})

function mostrarErrores(errores){
    divErrores.innerHTML = ""
    errores.forEach(error => {
        divErrores.innerHTML += `<p class="mt-1 border-l-4 border-red-800 bg-red-600 text-white px-2 uppercase">${error}</p>`
    });
}

function graficarContorno(h, k, r, x0, y0){
    // Definir la ecuación del círculo: (x - h)^2 + (y - k)^2 = r^2
    const xValues = [];
    const yValues = [];

    // Generar puntos para el círculo
    for (let i = 0; i <= 360; i++) {
        const angle = math.unit(i, 'deg');
        const x = h + r * math.cos(angle);
        const y = k + r * math.sin(angle);
        xValues.push(x);
        yValues.push(y);
    }

    // Crear el trazado
    const contorno = {
        x: xValues,
        y: yValues,
        mode: 'lines',
        line: {
            color: '#0ea5e9',
        },
        name: 'Contorno C',
        type: 'scatter'
    };

    const z0 = {
        x: [x0], // Coordenada x del punto
        y: [y0], // Coordenada y del punto
        mode: 'markers',
        marker: {
          color: '#3b82f6',
          size: 8,
          symbol: 'circle',
          line: {
            color: 'black',
            width: 2,
          },
        },
        name: 'z0',
        type: 'scatter'
    };

    // Definir el diseño del gráfico
    const layout = {
        xaxis: {
            title: 'Reales',
            zeroline: false,
        },
        yaxis: {
            title: 'Imaginarios',
            zeroline: false,
        },
        title: 'Gráfico del Contorno',
    };

    // Crear el gráfico
    Plotly.newPlot(grafico, [contorno, z0], layout, {responsive: true});
}