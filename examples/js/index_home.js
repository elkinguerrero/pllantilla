$(document).ready(function () {
    //arreglar los selects de keywords y formats
    const v_info = {
        url: 'http://localhost:3002/service?url=http://34.71.236.178',
        api_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MjU2OTA5ODcsImp0aSI6IlVWamotNXN6QlJKaENyUXZGbVBPUS1VbkxQcFFvVVhYUGdYb004SVRvQUk1RjdqN2pSNkZXVzIwWEdPNExKNEt1cFhJNWNlbkxhWVhXTjJHIn0.1wpsAyUMyFa48N-9l6qKLcBYeTedSckka2PzyrPtq8M',
        ip: 'https://34.71.236.178'
    }

    prueba = false;

    if (prueba == false) {
        //produccion
        v_info.url = window.location.origin;
        v_info.ip = window.location.origin;
    }

    if( $(document).width() >= 1800 ){
        alert("Advertencia: En pantallas que superen los 1800 pixeles, los objetos podran verse distorcionados ")
    }

    var data;

    if (typeof (Storage) !== "undefined") {
        fecha = new Date()
        fecha = fecha.getDate() + "/" + fecha.getMonth() + "/" + fecha.getFullYear() + "v_3"

        if (localStorage.getItem("data") == 'null' || localStorage.getItem("data") == null) {
            data = { traer_etiquetas: null, traer_datasets: null, traer_descripcion_dataset: {}, fecha: fecha };
        }
        else {
            data = JSON.parse(localStorage.getItem("data"));

            if (data.fecha != fecha) {
                data = { traer_etiquetas: null, traer_datasets: null, traer_descripcion_dataset: {}, fecha: fecha };
            }
        }
    }

    var validar_pintat = 0;
    var fadeIn = 0;
    var ultima_consulta = { nombre_filtro: "", tag_filtro: "", async: "", numero: 0 }
    var search = { title: 0, format: [] }
    var v_data_i_d = false;

    traer_etiquetas();
    traer_datasets("", "", true);
    acciones();

    function traer_etiquetas() {
        //----------------------------------------------------------------------------------
        //se traen los tags
        if (data.traer_etiquetas == null) {
            data.traer_etiquetas = JSON.parse(peticion(v_info.url + '/api/action/tag_list', "", "GET", false))
            console.log(data)
        }

        if (data.traer_etiquetas.success) {
            $('.keywords_tags').html("")
            for (i = 0; i < data.traer_etiquetas.result.length; i++) {
                if (i < 6) {
                    texto_temporal = data.traer_etiquetas.result[i];
                    if (texto_temporal.length > 5) {
                        texto_temporal = texto_temporal.substr(0, 5) + "..";
                    }

                    $('.keywords_tags').append('<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">' +
                        '<div class="keywords_botones keywords_botones_' + i + '">' + texto_temporal + '</div>' +
                        '</div>');
                }

                $('.keywords_select').append(
                    '<option value="' + data.traer_etiquetas.result[i] + '">' + data.traer_etiquetas.result[i] + '</option>'
                )
            }

            if (data.traer_etiquetas.result.length > 5) {
                $('.keywords_select').fadeIn();
            }
        }
        else if (data.traer_etiquetas == {}) {
            $('.keywords').hide()
        }
        else {
            console.log(data.traer_etiquetas)
            console.error("Error al consultar los tags contacte con el administrador del sistema")
        }
    }

    function traer_datasets(nombre_filtro, tag_filtro, async, continuacion) {
        if (data.traer_datasets != null) {
            if ((ultima_consulta.numero + 6) >= (data.traer_datasets.result.length - 1)) {
                return
            }
        }

        $('.fade').remove();

        ultima_consulta.nombre_filtro = nombre_filtro;
        ultima_consulta.tag_filtro = tag_filtro;
        ultima_consulta.async = async;

        //----------------------------------------------------------------------------------
        //se traen los datasets
        if (data.traer_datasets == null) {
            data.traer_datasets = JSON.parse(peticion(v_info.url + '/api/action/package_list', "", "GET", false))

            /*filtro dataset sirve para traer datasets especificos*/
            var temporal_array = [];
            var array_filtro = [
                'dm_vaccination',
                'dm_excess_mortality_month',
                'dm_policy_tracker_covid_country_codes',
                'dm_covid_global_mobility',
                'dm_flight_data_count',
                'dm_gender_poverty',
                'dm_covid_stats_jh',
                'dm_covid_stats_jh_not_aggregated',
                'dm_disaster_country_codes'
            ];

            for(var i = 0; i<data.traer_datasets.result.length;i++){
                for(var j = 0; j<array_filtro.length;j++){
                    if(data.traer_datasets.result[i] == array_filtro[j].toLocaleLowerCase() ){
                        temporal_array.push( data.traer_datasets.result[i] )
                    }
                } 
            }
            data.traer_datasets.result = temporal_array;
            /*fin filtro dataset*/
        }

        if (data.traer_datasets.success) {
            validar_pintat = 0;
            if (!continuacion) {
                ultima_consulta.numero = 0
                search.title = 0;
                search.format = [];
                $('.dataset_div').html("")
                object = data.traer_descripcion_dataset
                for (const property in object) {
                    object[property].pitar = false
                }
            }
            else {
                ultima_consulta.async = false;
                ultima_consulta.numero += 10;
            }

            formatos_generales = [];
            for (i = ultima_consulta.numero; i < data.traer_datasets.result.length; i++) {
                if (validar_pintat < 9) {
                    //console.log("cargando: "+i+" de "+data.traer_datasets.result.length)
                    traer_descripcion_dataset(data.traer_datasets.result[i], nombre_filtro, tag_filtro, async, true, continuacion)
                }
                else if (async && data.traer_descripcion_dataset[data.traer_datasets.result[i]] == undefined) {
                    search.title = data.traer_datasets.result.length;
                    traer_descripcion_async(data.traer_datasets.result[i])
                }
                else {
                    traer_descripcion_dataset(data.traer_datasets.result[i], nombre_filtro, tag_filtro, async, false, continuacion)
                }
            }

            //se valida si hay una peticion para una consulta de un dataset
            try {
                lsd = location.search.split("?")[1].split("&")
                for (s_d = 0; s_d < lsd.length; s_d++) {
                    if (lsd[s_d].split("dm=").length > 1) {
                        cambiar_pestana(["opc", btoa(lsd[s_d].split("dm=")[1]), 1])
                    }
                }
            } catch (err) {
            }

            $(".margen").animate({ "opacity": 1 }, 1000)
            $('.opciones').click(function () {
                $(".cont-head").show();
                var opcion_selec = this.classList[1].split("_");
                $(".cuadro_" + opcion_selec[2]).addClass("show active");
                console.log(opcion_selec[2]);
                cambiar_pestana(this.classList[1].split("_"))
            });

            $('.formats_texto_array').html("")
            object = search.format
            for (const property in object) {
                if (async) { object[property] = search.title }
                $('.formats_texto_array').append('<div class="formats_texto">' + property + ' <span class="formats_numero">' + object[property] + '</span></div>')
            }

            $('.botonnes_fin').fadeIn()
            localStorage.setItem("data", JSON.stringify(data));
        }
        else {
            console.error("Error al consultar los tags contacte con el administrador del sistema")
        }
    }

    function traer_descripcion_dataset(dataset, nombre_filtro, tag_filtro, async, pintar, continuacion) {
        if (data.traer_descripcion_dataset[dataset] == undefined) {
            data.traer_descripcion_dataset[dataset] = JSON.parse(peticion(v_info.url + '/api/action/package_show?id=' + dataset, "", "GET", false))
            data.traer_descripcion_dataset[dataset].pitar = false;
            validar_variable_cache(dataset)
        }

        data.traer_descripcion_dataset[dataset].result.notes = data.traer_descripcion_dataset[dataset].result.notes == null ? 'This dataset has no description' : data.traer_descripcion_dataset[dataset].result.notes;
        validar_filtro = true;

        for (t_d_d_i = 0; t_d_d_i < data.traer_descripcion_dataset[dataset].result.resources.length; t_d_d_i++) {
            if (tag_filtro != "") {
                for (t_d_d_j = 0; t_d_d_j < data.traer_descripcion_dataset[dataset].result.tags.length; t_d_d_j++) {
                    if (data.traer_descripcion_dataset[dataset].result.tags[t_d_d_j].name == tag_filtro) {
                        validar_filtro = false;
                    }
                }
                if (validar_filtro) { return }
            }

            data.traer_descripcion_dataset[dataset].result.notes = data.traer_descripcion_dataset[dataset].result.notes == undefined ? "" : data.traer_descripcion_dataset[dataset].result.notes;
            data.traer_descripcion_dataset[dataset].result.name = data.traer_descripcion_dataset[dataset].result.name == undefined ? "" : data.traer_descripcion_dataset[dataset].result.name;

            if (nombre_filtro != "" && data.traer_descripcion_dataset[dataset].result.name.toLowerCase().split(nombre_filtro.toLowerCase()).length < 2 && data.traer_descripcion_dataset[dataset].result.notes.toLowerCase().split(nombre_filtro.toLowerCase()).length < 2 && dataset.toLowerCase().split(nombre_filtro.toLowerCase()).length < 2) {
                return
            }

            if (!continuacion) {
                for (t_d_d_j = 0; t_d_d_j < data.traer_descripcion_dataset[dataset].result.resources.length; t_d_d_j++) {
                    if (search.format[data.traer_descripcion_dataset[dataset].result.resources[t_d_d_j].format] == undefined) {
                        search.format[data.traer_descripcion_dataset[dataset].result.resources[t_d_d_j].format] = 1
                    }
                    else {
                        search.format[data.traer_descripcion_dataset[dataset].result.resources[t_d_d_j].format] += 1
                    }
                }
                search.title += 1;
            }
        }

        if (!data.traer_descripcion_dataset[dataset].pitar && pintar) {
            texto_dataset = data.traer_descripcion_dataset[dataset].result.name;//.replace(/_/g," ");
            if (texto_dataset.length > 30) { texto_dataset = texto_dataset.substr(0, 30) + "..."; }

            try {
                data.traer_descripcion_dataset[dataset].result.resources[0].url = JSON.parse( atob( data.traer_descripcion_dataset[dataset].result.resources[0].description ) ).url_tablero 
                
            }catch (e) {
            }
            
            texto_dashboard = data.traer_descripcion_dataset[dataset].result.resources[0].url.split('tableau').length > 1 && data.traer_descripcion_dataset[dataset].result.resources[0].url.split('view').length > 1 ? '<i class="opciones opc_' + btoa(dataset) + '_5 opcion_5 fa fa-database"width: 14%;" title="Analizis"></i>' : '';

            if (data.traer_descripcion_dataset[dataset].result.resources[0].mapas == undefined) {
                try {
                    validar_filas = JSON.parse(peticion(v_info.url + '/api/3/action/datastore_search?limit=1&resource_id=' + data.traer_descripcion_dataset[dataset].result.resources[0].id, "", "GET", false));
                    valirar_filas_comprobacion = false;
                    for (t_d_d_i = 0; t_d_d_i < validar_filas.result.fields.length; t_d_d_i++) {
                        if (validar_filas.result.fields[t_d_d_i].type == "float8") {
                            t_d_d_i = validar_filas.result.fields.length;
                            valirar_filas_comprobacion = true;
                        }

                    }
                    data.traer_descripcion_dataset[dataset].result.resources[0].mapas = valirar_filas_comprobacion;
                    localStorage.setItem("data", JSON.stringify(data));
                } catch (error) {
                    data.traer_descripcion_dataset[dataset].result.resources[0].mapas = false;
                }

            }

            texto_dextipcion_dataset_service = data.traer_descripcion_dataset[dataset].result.notes;
            try {
                if( JSON.parse(atob(data.traer_descripcion_dataset[dataset].result.resources[0].description)).descripcion != undefined ){
                    texto_dextipcion_dataset_service = JSON.parse(atob(data.traer_descripcion_dataset[dataset].result.resources[0].description)).descripcion
                }
            } catch (e) {
            }
            texto_maps = data.traer_descripcion_dataset[dataset].result.resources[0].mapas ? '<i class="opciones opc_' + btoa(dataset) + '_3 opcion_3 fa fa-database"width: 14%;" title="Analisis"></i>' : '';
            if( texto_dataset == null || texto_dataset == 'null' ){
                console.log(data.traer_descripcion_dataset[dataset])
            }

            var col_t = 6
            if( $(document).width() > 2100 ){
                col_t = 3;
            }else if( $(document).width() > 1800 ){
                col_t = 4;
            }
            
            $('.dataset_div').append('<div class="fade fade_' + fadeIn + ' col-sm-12 col-lg-'+col_t+'">' +
                '<div class="card card-stats">' +
                '<div class="card-body ">' +
                '<div class="row botones_menu">' +
                '<div class="col-2 card-footer menu_botones_linea">' +
                '<i class="opciones opc_' + btoa(dataset) + '_1 opcion_1 fa fa-info-circle"width: 14%;" title="Information"></i>' +
                '<i class="opciones opc_' + btoa(dataset) + '_2 opcion_2 fa fa-bars"width: 14%;" title="Tables"></i>' +
                texto_maps +
                '<i class="opciones opc_' + btoa(dataset) + '_4 opcion_4 fa fa-pie-chart"width: 14%;" title="Visualization"></i>' +
                texto_dashboard +
                '<i class="opciones opc_' + btoa(dataset) + '_6 opcion_6 fa fa-download"width: 14%;" title="Export"></i>' +
                '<i class="opciones opc_' + btoa(dataset) + '_7 opcion_7 fa fa-code"width: 14%;" title="API"></i>' +
                '</div>' +
                '<div class="col-10">' +
                '<div class="numbers">' +
                '<h4 class="card-title" style="font-size: 15px;text-align: center; margin-top: 8%;">' + texto_dataset + '</h4>' +
                '<p class="card-category" style="font-size: 12px;text-align: justify;">' + texto_dextipcion_dataset_service + '</p>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');
        }

        if (async && !continuacion) {
            $(".fade_" + fadeIn).delay(2000).animate({ "opacity": 1 }, 1000)
        }
        else {
            $(".fade_" + fadeIn).delay(500).animate({ "opacity": 1 }, 1000)
        }

        fadeIn += 1;
        validar_pintat += 1;
    }

    function traer_descripcion_async(dataset) {
        var respuesta = new XMLHttpRequest();
        respuesta.onreadystatechange = function () { };
        respuesta.open('GET', v_info.url + '/api/action/package_show?id=' + dataset, true);
        respuesta.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        respuesta.onload = function (e) {
            if (respuesta.readyState == 4 && respuesta.status == 200) {
                data.traer_descripcion_dataset[dataset] = JSON.parse(respuesta.responseText)
                data.traer_descripcion_dataset[dataset].pitar = false;
                validar_variable_cache(dataset)
                localStorage.setItem("data", JSON.stringify(data));

                //se valida si la url tiene envio a algun dataset
                try {
                    lsd = location.search.split("?")[1].split("&")
                    for (s_d = 0; s_d < lsd.length; s_d++) {
                        if (lsd[s_d].split("dm=").length > 1) {
                            console.log("lsd2")
                            console.log(lsd[s_d].split("dm="))
                            cambiar_pestana(["opc", btoa(lsd[s_d].split("dm=")[1]), 1])
                        }
                    }
                } catch (err) {
                }
            }
            else {
                console.error(respuesta.statusText);
            }
        };
        respuesta.send("");
    }

    function acciones() {
        $(".keywords_botones").click(function () {
            traer_datasets("", data.traer_etiquetas.result[this.classList[1].replace('keywords_botones_', '')]);
        })

        $('#Capa_1').click(function () {
            traer_datasets($(".buscar").val(), '');
        })

        $(".buscar").keypress(function (e) {
            if (e.which == 13) {
                traer_datasets($(".buscar").val(), '');
            }
        });

        $(".formats_texto").click(function (e) {
            traer_datasets('', '');
        });

        $('.siguiente').click(function () {
            traer_datasets(ultima_consulta.nombre_filtro, ultima_consulta.tag_filtro, ultima_consulta.async, true)
        });

        $('.previo').click(function () {
            if (ultima_consulta.numero >= 6) {
                if (ultima_consulta.numero == 6) { ultima_consulta.numero = -6 }
                else { ultima_consulta.numero -= 12; }
                traer_datasets(ultima_consulta.nombre_filtro, ultima_consulta.tag_filtro, ultima_consulta.async, true)
            }
        });

        $(".keywords_select").change(function () {
            traer_datasets("", this.value);
        })
    }

    function traer_iconos(x) {
        if (x == 1) {
            return '<svg version="1.1" x="0px" y="0px" viewBox="0 0 25 25" style="enable-background:new 0 0 25 25;" xml:space="preserve" class="icon_1">' +
                '<g>' +
                '<ellipse transform="matrix(0.3827 -0.9239 0.9239 0.3827 -4.0375 19.3764)" class="icon1_2" cx="12.5" cy="12.7" rx="9.7" ry="9.7"></ellipse>' +
                '</g>' +
                '<g>' +
                '<defs>' +
                '<rect id="SVGID_3_" x="-365" y="-642" width="1449.9" height="1452"></rect>' +
                '</defs>' +
                '<path class="icon1_6" d="M12.7,17c-0.1,0-0.1-0.1-0.1-0.2c0-0.1,0-0.1,0-0.2l1-5.1c0-0.1,0-0.2,0-0.4c0-0.3-0.1-0.6-0.3-0.7 c-0.4-0.4-1.2-0.3-2.5,0.1l-0.1,0l-0.1,0.7h0.2c0.7,0,0.8,0.1,0.9,0.1c0,0,0.1,0,0.1,0.1c0,0,0,0.1,0,0.1c0,0.1,0,0.1,0,0.2l-1,4.7 c0,0.2-0.1,0.4-0.1,0.6c0,0.4,0.1,0.7,0.3,0.9c0.2,0.2,0.5,0.3,0.8,0.3c0.4,0,1-0.1,1.7-0.3l0.1,0l0.1-0.7h-0.2 C13,17.1,12.8,17.1,12.7,17"></path>' +
                '<path class="icon1_6" d="M14,7.6c-0.2-0.2-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,0.8c0,0.3,0.1,0.6,0.3,0.8 c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3c0.2-0.2,0.3-0.5,0.3-0.8C14.3,8,14.2,7.7,14,7.6"></path>' +
                '</g>' +
                '</svg>';
        }
        else if (x == 2) {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.25 11.39" class="icon_2">' +
                '<path class="icon2-1" d="M1.29,11.27H12a1.17,1.17,0,0,0,1.17-1.16V1.29A1.16,1.16,0,0,0,12,.13H1.29A1.15,1.15,0,0,0,.13,1.29v8.82a1.15,1.15,0,0,0,1.16,1.16M8.48,6.16H4.77V4.3H8.48ZM4.77.59H8.48V3.84H4.77Zm0,6H8.48V8.48H4.77ZM8.48,10.8H4.77V9H8.48ZM4.3,8.48H.59V6.63H4.3ZM9,6.63h3.71V8.48H9Zm3.71-.47H9V4.3h3.71Zm-8.36,0H.59V4.3H4.3ZM.59,10.11V9H4.3V10.8h-3a.69.69,0,0,1-.7-.69M12,10.8H9V9h3.71v1.16a.69.69,0,0,1-.7.69m.7-9.51V3.84H9V.59h3a.7.7,0,0,1,.7.7M1.29.59h3V3.84H.59V1.29a.7.7,0,0,1,.7-.7M1.29,2a.23.23,0,0,1,.23-.23H3.38a.23.23,0,1,1,0,.46H1.52A.23.23,0,0,1,1.29,2m6.5,0a.23.23,0,0,1-.24.23H5.7a.23.23,0,1,1,0-.46H7.55A.23.23,0,0,1,7.79,2M9.64,2a.23.23,0,0,1,.24-.23h1.85a.23.23,0,1,1,0,.46H9.88A.23.23,0,0,1,9.64,2"/>' +
                '<path class="icon2-2" d="M1.29,11.27H12a1.17,1.17,0,0,0,1.17-1.16V1.29A1.16,1.16,0,0,0,12,.13H1.29A1.15,1.15,0,0,0,.13,1.29v8.82A1.15,1.15,0,0,0,1.29,11.27ZM8.48,6.16H4.77V4.3H8.48ZM4.77.59H8.48V3.84H4.77Zm0,6H8.48V8.48H4.77ZM8.48,10.8H4.77V9H8.48ZM4.3,8.48H.59V6.63H4.3ZM9,6.63h3.71V8.48H9Zm3.71-.47H9V4.3h3.71Zm-8.36,0H.59V4.3H4.3ZM.59,10.11V9H4.3V10.8h-3A.69.69,0,0,1,.59,10.11ZM12,10.8H9V9h3.71v1.16A.69.69,0,0,1,12,10.8Zm.7-9.51V3.84H9V.59h3A.7.7,0,0,1,12.66,1.29ZM1.29.59h3V3.84H.59V1.29A.7.7,0,0,1,1.29.59ZM1.29,2a.23.23,0,0,1,.23-.23H3.38a.23.23,0,1,1,0,.46H1.52A.23.23,0,0,1,1.29,2Zm6.5,0a.23.23,0,0,1-.24.23H5.7a.23.23,0,1,1,0-.46H7.55A.23.23,0,0,1,7.79,2ZM9.64,2a.23.23,0,0,1,.24-.23h1.85a.23.23,0,1,1,0,.46H9.88A.23.23,0,0,1,9.64,2Z"/>' +
                '</svg>';
        }
        else if (x == 3) {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.29 19.29" class="icon_3">' +
                '<path class="icon3-1" d="M4.36,10.44s-.09-.1-.2-.1a.75.75,0,0,1-.37-.13.19.19,0,0,0-.28,0c-.06.07,0,.13.06.13a.56.56,0,0,1,.28.1.57.57,0,0,0,.31.09c.11,0,.2,0,.2-.09"/>' +
                '<path class="icon3-1" d="M5.05,10.63a.6.6,0,0,1-.15-.18l-.13.08-.14.09a2.36,2.36,0,0,0-.54.35h1a.12.12,0,0,0,.12-.12.31.31,0,0,0-.12-.22"/>' +
                '<path class="icon3-1" d="M8.4,1c.06,0,.1,0,0,0h0"/>' +
                '<path class="icon3-1" d="M11.11,6.23h0A.91.91,0,0,0,11,6.6a1.29,1.29,0,0,0,0,.23s.11,0,.2-.07l.24-.19s.07-.11.07-.2V6.31a1.34,1.34,0,0,0-.12-.24.73.73,0,0,1-.12-.25V5.74c-.05-.11-.15-.2-.21-.2h0s0,.15,0,.19l0,0c.05.14.13.34.18.45Z"/>' +
                '<path class="icon3-1" d="M10.56,6.55l.07,0a.44.44,0,0,0,.18-.26,1.08,1.08,0,0,0,0-.34l-.1.06c-.09,0-.19.08-.19.16s-.06.41,0,.4"/>' +
                '<path class="icon3-1" d="M16.06,13.76c-.2.26-.39.51-.43.54a3,3,0,0,0-.23.34l0,.06,0,.05a.63.63,0,0,0,.18.19l.12,0,0,0s.05,0,.08-.09a.58.58,0,0,0,.07-.19,3.1,3.1,0,0,1,.22-.48v0c.07-.23.17-.55.23-.72l-.11.17Z"/>' +
                '<path class="icon3-1" d="M9.65,0a9.65,9.65,0,1,0,9.64,9.64A9.66,9.66,0,0,0,9.65,0m5.11,2a8.39,8.39,0,0,1,.82.62c0,.06,0,.11,0,.14s-.08.34-.19.52l-.27-.22a6,6,0,0,0-.33-.74c0-.05,0-.21,0-.32m-2,6.45.17-.23h.21l.44.15,0-.33h.19l.38.34h.68a3.56,3.56,0,0,1-.13.36c-.06.1-.41.2-.41.2h-.49l-.25,0-.29.19L12.91,9a2.25,2.25,0,0,1-.39-.38c0-.08-.43-.13-.51-.16a.84.84,0,0,0-.55,0,.9.9,0,0,1-.38.16c-.24.06.25-.32.38-.36s.19-.29.27-.48.44,0,.44,0h.22a1.27,1.27,0,0,1,.32.3c.09.14-.05.08-.11.18s.14.23.14.23m1.2-1a.84.84,0,0,0,.27-.18c.08-.1.25,0,.25,0l.15-.37a3.21,3.21,0,0,1,.17.36c0,.08.33.22.33.22L15,7.65H14.1Zm1,1.93a1.37,1.37,0,0,1,.19.37c.05.18.38.47.43.74a1,1,0,0,1,0,.47,5.32,5.32,0,0,1-.32-.44,2.41,2.41,0,0,0-.44-.46c-.11-.08-.13-.68-.13-.68Zm-6.29-5h0l0,0,0,0s0,0,0,0l0,0h0l0,0M.44,9.77l0,0,0,0V9.77m0,.26h0c.2.11,0,0,.2.11l.19.08a.22.22,0,0,1,0-.16c0-.11.13.08,0-.11s-.05,0-.1-.19L.71,9.55s0-.13,0-.13.18.3.18.3a1.4,1.4,0,0,0,.23.38l.08.05a.52.52,0,0,1,.13.22c0,.11-.13.14,0,.22s-.05-.08.14.08a1.15,1.15,0,0,0,.38.19c.08.05.11-.16.19,0s-.16,0,.08.16l.38.25s0-.17.19,0a.75.75,0,0,0,.36.19.54.54,0,0,0,.16.19c.14.11,0-.05.14.11l.14.16.24.16h.11l.08.14.22.27v.19s-.14-.19-.14,0,0,0,0,.2L4,13l.17.22v.38a1.74,1.74,0,0,0,.24.24c.08.06-.13-.13.08.06l.22.19.3.27v.11s.19-.14.27,0,.19.27.19.27v.11s.11-.22.17,0a.56.56,0,0,1,0,.33.82.82,0,0,1,.19.21c0,.08-.06.17,0,.25a2.66,2.66,0,0,1,.13.43l.22.44a.37.37,0,0,0,0,.24c.06.09.14.25.14.25a.23.23,0,0,0,0,.35c.19.19.08,0,.19.19A3.82,3.82,0,0,1,6.7,18l.35.41.23.18A9.24,9.24,0,0,1,.44,10m9.21,8.82a9.47,9.47,0,0,1-2.08-.23h0l-.27-.55s.06-.16,0-.24l-.09-.08-.08-.14v-.19s.11-.14,0-.19-.11.11-.11-.06V17a1.06,1.06,0,0,0,.19-.19c.06-.08,0,.11.06-.08a2.73,2.73,0,0,0,.13-.44l.2-.16v-.35a.33.33,0,0,1,0-.19,1.2,1.2,0,0,0,0-.28l.16-.11c.08-.05.3-.24.3-.24s-.14-.08,0-.16.21-.17.19-.28,0,.17,0-.1A2,2,0,0,1,8.17,14c0-.19-.11,0,0-.19a5.4,5.4,0,0,0,.27-.48,1.41,1.41,0,0,0-.27-.23c-.08,0-.16-.08-.3-.13l-.52-.19a2.32,2.32,0,0,0-.27-.11,2.32,2.32,0,0,1-.35-.41l-.28-.08c-.24-.09-.3-.11-.38-.19s-.3-.28-.3-.28l0-.13s-.08.08-.33,0a1,1,0,0,1-.46-.22.6.6,0,0,0-.25.06,2.91,2.91,0,0,0-.29.19l-.19,0-.36,0-.24-.14-.14-.3a.34.34,0,0,0-.11-.19l-.3-.22.11-.32s-.11-.14-.22-.09a1.39,1.39,0,0,0-.27.25.23.23,0,0,1-.16,0,1.07,1.07,0,0,1-.36-.22A.52.52,0,0,1,2,10.13a2.34,2.34,0,0,1,.16-.44l.47-.33h.27l.3-.13.3.38.24.3S4,9.72,4,9.63l-.17-.24L4,9.09c0-.08.1-.11.21-.27l.22-.33L4.66,8l.22-.17.19-.24.13-.14h.22l.38-.19h.25L5.83,7l-.14-.16a1.36,1.36,0,0,1,.52-.22s.38-.22.35-.14A3.12,3.12,0,0,1,6.24,7l.21.16s.25,0,.3,0a.72.72,0,0,0,.08-.27l-.08-.34V6.1c0-.14,0-.49-.13-.44s-.17-.24-.17-.24V5l-.3.28s-.21,0-.19-.11S6.13,5,6.13,5l-.3-.24s-.33-.22-.38-.14a1.7,1.7,0,0,0-.14.3l-.14.3v.19l-.1.27L4.74,6l-.16.33S4.52,6,4.52,5.88s-.35-.41-.35-.41l-.08-.33a1.2,1.2,0,0,0,.11-.3c0-.08.13-.24.24-.35a4.35,4.35,0,0,1,.46-.38l.27-.17,0,.47.35-.06,0-.24.3-.17.16-.43s.17-.38.25-.33a2.72,2.72,0,0,1,.27.3l-.3.6H5.85l-.08.25a.63.63,0,0,1,.25.1,4,4,0,0,1,.3.3l.33-.24V4.27h.24l.16-.35,0-.25a.8.8,0,0,1,0-.19l0-.11-.11-.19V2.69l-.16-.3H6.26L5.42,2H5.2L4.83,1.8A8.92,8.92,0,0,1,6.91.85C6.83.91,6.78,1,6.78,1a1.37,1.37,0,0,0,.13.57.51.51,0,0,0,.28.24l.11,0c.11,0,.33-.29.38-.38a2.39,2.39,0,0,1,.54-.35l0,0h.17l.06,0c-.06,0-.15.07-.2.17l-.19.14-.21.16A.69.69,0,0,0,7.9,2L8,2.15l.08.13a1.06,1.06,0,0,1,0,.2v.08c0,.08,0,.32,0,.4s-.16.52-.16.6a4.32,4.32,0,0,1-.11.58l-.16.1c-.17.11,0,.2,0,.33s-.19.11,0,.27.1,0,.19.17,0,0,.19,0l.15,0,.44-.55h0l.06-.05.07,0c.35-.27.14-.14.35-.27S9,4,9.31,3.89l.27-.08a1.71,1.71,0,0,0,.55-.49l0-.08c0-.08.08-.08,0-.19s-.2.16-.08-.11.05-.27.12-.38-.12,0,0-.25l.12-.3a.19.19,0,0,0-.08-.24l.16-.11a.77.77,0,0,0,.26-.25.23.23,0,0,0,0-.27l.14-.08c.13-.08.1.06.19-.16A1.77,1.77,0,0,1,11,.68l.05-.13A9.14,9.14,0,0,1,14.73,2a.59.59,0,0,1-.16.15c-.16.11,0,.33,0,.44a.45.45,0,0,0,0,.27,4.35,4.35,0,0,0,.5.35.81.81,0,0,1,.22.23l0,0s0,0-.2.11l-.5.24s-.33.11-.36,0-.27-.16-.27-.16a.8.8,0,0,0-.24-.16,1.42,1.42,0,0,1-.3-.2s-.25-.08-.36,0-.43.19-.49.38-.13.38-.16.49a3.59,3.59,0,0,1-.46.63c-.11.11-.25.33-.17.43s.3.39.38.33l.08,0,.39.27s.31-.67.29-.68-.12-.38,0-.46.21-.49.3-.41-.11.68-.11.68l.46.19s.33-.16.19,0-.38.33-.41.41A5.89,5.89,0,0,1,12.9,6h-.35a.69.69,0,0,0-.49,0,4.45,4.45,0,0,0-.57.49v.38s-.27-.16-.33,0a.82.82,0,0,0,0,.37l.11.23s0,.1-.25.13-.26-.16-.32,0a1,1,0,0,0,0,.41l0,.31s.13-.43.1,0,.19.07,0,.42,0,.08-.22.35a7,7,0,0,0-.38.62c-.17.23-.22.47-.31.54s0,.12,0,.23a3.12,3.12,0,0,0,0,.44s.2.41.25.49.08.16.19.3l.11.13s.25-.08.33,0l.08.09h.38c.08,0,.14,0,.22,0a1.7,1.7,0,0,1,.3-.14L12,12l.28.11c.08.22-.06.49,0,.6s.28.38.36.38a.49.49,0,0,1,.21.11v.52l-.13.3,0,.16a1.19,1.19,0,0,0,0,.44c.06.16.09.54.18.62a.77.77,0,0,1,.15.35l.22.47.65-.22a.71.71,0,0,0,.41-.46c.11-.28.12-.57.22-.66a2.3,2.3,0,0,0,.35-.35,3.12,3.12,0,0,0,.38-.57,5.61,5.61,0,0,0-.05-.79.33.33,0,0,1,.05-.3,5.56,5.56,0,0,0,.52-.6c0-.11.41-.54.43-.63s.08-.46,0-.4l-.4.21s-.25-.35-.14-.32a1.59,1.59,0,0,0,.79-.24,4.37,4.37,0,0,0,.57-.55V9.76a1.38,1.38,0,0,0-.22-.13l-.32-.05-.22-.19S15.76,9,16,9.06a8.69,8.69,0,0,1,.92.33,3.21,3.21,0,0,0,.54,0c.09,0,.55.3.63.37a5,5,0,0,1,.41.54l.33.43v0a9.22,9.22,0,0,1-9.14,8.1"/>' +
                '</svg>';
        }
        else if (x == 4) {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 13" class="icon_4">' +
                '<path class="icon4-1" d="M7,5.88l-.07,0a.2.2,0,0,1-.14-.19V.33A.21.21,0,0,1,7,.13a5.48,5.48,0,0,1,3.32,1.11.21.21,0,0,1,0,.29L7.17,5.79A.22.22,0,0,1,7,5.88M7.21,5,9.9,1.45l-.11-.07A5.12,5.12,0,0,0,7.34.55H7.21Z"/>' +
                '<path class="icon4-1" d="M7,.25a5.39,5.39,0,0,1,3.25,1.09.09.09,0,0,1,0,.12L7.07,5.72a.1.1,0,0,1-.08,0H7a.09.09,0,0,1,0-.08V.33A.08.08,0,0,1,7,.25m.08,5.17.45-.6L9.92,1.63l.16-.21-.22-.15A5.25,5.25,0,0,0,7.35.43l-.27,0v5M7,0a.33.33,0,0,0-.33.33V5.67A.32.32,0,0,0,6.9,6L7,6a.37.37,0,0,0,.27-.13l3.19-4.26a.34.34,0,0,0-.06-.47A5.59,5.59,0,0,0,7,0m.33,4.67v-4a4.87,4.87,0,0,1,2.39.8Z"/>' +
                '<path class="icon4-1" d="M7.94,6.54a.21.21,0,0,1-.17-.09.2.2,0,0,1,0-.24L11,2a.22.22,0,0,1,.14-.09h0a.23.23,0,0,1,.14,0A5.58,5.58,0,0,1,13.2,4.58a.23.23,0,0,1-.13.27L8,6.53Zm.57-.62,4.22-1.4-.05-.13a5.17,5.17,0,0,0-1.4-1.94l-.1-.08Z"/>' +
                '<path class="icon4-1" d="M11.14,1.74V2a.06.06,0,0,1,0,0,5.37,5.37,0,0,1,1.89,2.61.11.11,0,0,1-.05.11L7.94,6.42a.08.08,0,0,1-.06,0,.07.07,0,0,1,0-.1L11.07,2l0,0,0-.25m-3,4.43.76-.25,3.72-1.24.25-.09-.1-.24a5.18,5.18,0,0,0-1.44-2l-.2-.18L11,2.4,8.65,5.53l-.48.64m3-4.43h-.05a.34.34,0,0,0-.22.13L7.68,6.13a.33.33,0,0,0,.26.54l.11,0L13.11,5a.34.34,0,0,0,.21-.42,5.64,5.64,0,0,0-2-2.73.31.31,0,0,0-.2-.07M8.85,5.68,11.2,2.55a5,5,0,0,1,1.37,1.89Z"/>' +
                '<path class="icon4-1" d="M1.51,9.87a.21.21,0,0,1-.17-.08,5.54,5.54,0,0,1,4.33-9A.22.22,0,0,1,5.88,1V6.33a.21.21,0,0,1-.08.17L1.64,9.83a.22.22,0,0,1-.13,0M5.33,1.22a5.12,5.12,0,0,0-3.87,8l.08.11L5.46,6.23v-5Z"/>' +
                '<path class="icon4-1" d="M5.67.92A.08.08,0,0,1,5.75,1V6.33a.09.09,0,0,1,0,.07L1.56,9.73l-.06,0-.06,0A5.41,5.41,0,0,1,5.67.92M1.51,9.55l.21-.17,3.77-3,.09-.08V1.08l-.26,0A5.25,5.25,0,0,0,.42,6.33a5.18,5.18,0,0,0,.94,3l.15.22M5.67.67A5.67,5.67,0,0,0,0,6.33,5.61,5.61,0,0,0,1.24,9.87.36.36,0,0,0,1.5,10a.32.32,0,0,0,.21-.08L5.88,6.59A.34.34,0,0,0,6,6.33V1A.33.33,0,0,0,5.67.67M1.57,9.19a4.93,4.93,0,0,1-.9-2.86,5,5,0,0,1,4.66-5V6.17Z"/>' +
                '<path class="icon4-1" d="M6.23,12.88A5.51,5.51,0,0,1,1.9,10.79a.19.19,0,0,1,0-.15.23.23,0,0,1,.08-.14L6.1,7.17a.2.2,0,0,1,.13,0,.22.22,0,0,1,.15.06L10.15,11a.23.23,0,0,1,0,.29,5.51,5.51,0,0,1-3.92,1.63M2.36,10.69l.09.1a5.11,5.11,0,0,0,7.15.4l.1-.09L6.21,7.61Z"/>' +
                '<path class="icon4-1" d="M6.23,7.25a.08.08,0,0,1,.06,0l3.77,3.78a.08.08,0,0,1,0,.11,5.35,5.35,0,0,1-3.83,1.59,5.41,5.41,0,0,1-4.23-2,.14.14,0,0,1,0-.07l0-.05L6.18,7.27a.06.06,0,0,1,.05,0m0,5.33a5.3,5.3,0,0,0,3.46-1.29l.2-.18-.19-.19L6.38,7.6l-.16-.15-.17.13L2.39,10.51l-.21.17.18.2a5.26,5.26,0,0,0,3.87,1.7M6.23,7A.33.33,0,0,0,6,7.07L1.86,10.4a.35.35,0,0,0-.12.23.31.31,0,0,0,.07.24,5.66,5.66,0,0,0,8.43.47.33.33,0,0,0,0-.47L6.46,7.1A.3.3,0,0,0,6.23,7m0,5.33a5,5,0,0,1-3.69-1.62L6.2,7.78,9.52,11.1a5,5,0,0,1-3.29,1.23"/>' +
                '<path class="icon4-1" d="M12.1,11.67A.21.21,0,0,1,12,11.6L8.19,7.83a.2.2,0,0,1-.06-.19.21.21,0,0,1,.14-.15L13.32,5.8h0a.23.23,0,0,1,.23.13,5.64,5.64,0,0,1,.29,1.76,5.47,5.47,0,0,1-1.63,3.91.21.21,0,0,1-.15.07M8.72,7.78l3.38,3.38.09-.1a5.1,5.1,0,0,0,1.27-3.37,5.21,5.21,0,0,0-.17-1.3l0-.13Z"/>' +
                '<path class="icon4-1" d="M13.39,5.92a.07.07,0,0,1,.08,0,5.41,5.41,0,0,1-1.31,5.55.07.07,0,0,1-.06,0,.06.06,0,0,1,0,0L8.27,7.75a.13.13,0,0,1,0-.08.09.09,0,0,1,.06-.06l5.06-1.69h0m-1.28,5.42.18-.2a5.25,5.25,0,0,0,1.29-3.45,5,5,0,0,0-.17-1.33l-.07-.26-.25.09L8.87,7.59l-.38.13L8.77,8l3.15,3.15.19.18m1.28-5.67h-.1L8.23,7.37A.35.35,0,0,0,8,7.61a.33.33,0,0,0,.09.31l3.77,3.77a.3.3,0,0,0,.23.1.31.31,0,0,0,.24-.1,5.62,5.62,0,0,0,1.66-4,5.84,5.84,0,0,0-.29-1.8.35.35,0,0,0-.32-.22M12.1,11,9,7.83l4.22-1.4a4.84,4.84,0,0,1,.16,1.26A5,5,0,0,1,12.1,11"/>' +
                '</svg>'
        }
        else if (x == 5) {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.35 10" class="icon_5">' +
                '<path class="icon5-1" d="M12.13,0a1.22,1.22,0,0,0-1.21,1.22,1.26,1.26,0,0,0,.17.6l-2,2a1.16,1.16,0,0,0-1.3,0L5.63,2a1.18,1.18,0,0,0,.13-.52A1.21,1.21,0,0,0,4.56.3,1.2,1.2,0,0,0,3.34,1.5a1.19,1.19,0,0,0,.25.75L1.7,4.65a1.15,1.15,0,0,0-.48-.1A1.2,1.2,0,0,0,0,5.75a1.21,1.21,0,1,0,2.42,0A1.19,1.19,0,0,0,2.18,5l1.88-2.4A1.17,1.17,0,0,0,5.25,2.5L7.4,4.32a1.24,1.24,0,0,0-.12.53,1.21,1.21,0,1,0,2.42,0,1.33,1.33,0,0,0-.17-.64l2-2A1.21,1.21,0,0,0,12.77.17,1.33,1.33,0,0,0,12.13,0M1.22,6.36a.61.61,0,1,1,.6-.6.6.6,0,0,1-.6.6M4.55,2.12a.61.61,0,1,1,.61-.6.61.61,0,0,1-.61.6M8.49,5.46a.61.61,0,0,1-.61-.61.61.61,0,1,1,.61.61m3.64-3.64a.61.61,0,1,1,.6-.61.61.61,0,0,1-.6.61"/>' +
                '<path class="icon5-1" d="M1.22,7.58a.3.3,0,0,0-.31.3V9.7a.31.31,0,0,0,.61,0V7.88a.3.3,0,0,0-.3-.3"/>' +
                '<path class="icon5-1" d="M3,6.36a.31.31,0,0,0-.3.31v3a.31.31,0,0,0,.61,0v-3A.31.31,0,0,0,3,6.36"/>' +
                '<path class="icon5-1" d="M4.85,3.94a.3.3,0,0,0-.3.3V9.7a.31.31,0,0,0,.61,0V4.24a.3.3,0,0,0-.31-.3"/>' +
                '<path class="icon5-1" d="M6.67,5.45a.3.3,0,0,0-.3.31V9.7a.3.3,0,1,0,.6,0V5.76a.3.3,0,0,0-.3-.31"/>' +
                '<path class="icon5-1" d="M8.49,7.58a.29.29,0,0,0-.3.3V9.7a.3.3,0,0,0,.6,0V7.88a.29.29,0,0,0-.3-.3"/>' +
                '<path class="icon5-1" d="M10.31,6.36a.31.31,0,0,0-.31.31v3a.31.31,0,0,0,.61,0v-3a.31.31,0,0,0-.3-.31"/>' +
                '<path class="icon5-1" d="M12.13,3.64a.3.3,0,0,0-.31.3V9.7a.31.31,0,0,0,.61,0V3.94a.3.3,0,0,0-.3-.3"/>' +
                '</svg>'
        }
        else if (x == 6) {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.82 12.02" class="icon_6">' +
                '<path class="icon6-1" d="M8.27,7.1a.55.55,0,0,1,.29.9L4.81,11.75s.07,0-.2.13-.56-.13-.56-.13L.29,8C0,7.66.13,7.58.21,7.41a.53.53,0,0,1,.86-.15L3.9,10.08V.61c.05-.4.17-.39.35-.45A.54.54,0,0,1,5,.66v9.42L7.83,7.21a.4.4,0,0,1,.44-.11"/>' +
                '<path class="icon6-2" d="M8.27,7.1a.55.55,0,0,1,.29.9L4.81,11.75s.07,0-.2.13-.56-.13-.56-.13L.29,8C0,7.66.13,7.58.21,7.41a.53.53,0,0,1,.86-.15L3.9,10.08V.61c.05-.4.17-.39.35-.45A.54.54,0,0,1,5,.66v9.42L7.83,7.21A.4.4,0,0,1,8.27,7.1Z"/>' +
                '</svg>'
        }
        else if (x == 7) {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20.37 20.37" class="icon_7">' +
                '<circle class="icon7-1" cx="10.19" cy="10.19" r="9.69" transform="translate(-2.07 17.76) rotate(-76.72)"/>' +
                '<path class="icon7-2" d="M15.94,5.19H4.44a.25.25,0,0,0-.25.25v9.5a.25.25,0,0,0,.25.25h11.5a.26.26,0,0,0,.25-.25V5.44a.25.25,0,0,0-.25-.25m-.25,2h-11V5.69h11Zm-11,7.5v-7h11v7Zm.57-8.08a.23.23,0,0,1-.08-.17.25.25,0,0,1,.08-.18.26.26,0,0,1,.35,0,.25.25,0,0,1,.08.18.28.28,0,0,1-.25.25.23.23,0,0,1-.18-.08m1,0a.23.23,0,0,1-.08-.17.25.25,0,0,1,.08-.18.26.26,0,0,1,.35,0,.24.24,0,0,1,.07.18.22.22,0,0,1-.07.17.23.23,0,0,1-.17.08.23.23,0,0,1-.18-.08m1,0a.22.22,0,0,1-.07-.17.24.24,0,0,1,.07-.18.26.26,0,0,1,.35,0,.25.25,0,0,1,.08.18.23.23,0,0,1-.08.17.23.23,0,0,1-.18.08.23.23,0,0,1-.17-.08m4.4,1.93L9.16,14a.25.25,0,0,1-.22.15.23.23,0,0,1-.11,0,.25.25,0,0,1-.12-.33l2.5-5.5a.25.25,0,0,1,.45.21M8.13,9.6,6.77,11.19l1.36,1.58a.25.25,0,0,1-.19.42.25.25,0,0,1-.19-.09l-1.5-1.75a.26.26,0,0,1,0-.33l1.5-1.75a.25.25,0,0,1,.38.33m6,1.42a.26.26,0,0,1,0,.33l-1.5,1.75a.25.25,0,0,1-.19.09.25.25,0,0,1-.19-.42l1.36-1.58L12.26,9.6a.25.25,0,0,1,.38-.33Z"/>' +
                '<path class="icon7-3" d="M15.94,5.19H4.44a.25.25,0,0,0-.25.25v9.5a.25.25,0,0,0,.25.25h11.5a.26.26,0,0,0,.25-.25V5.44A.25.25,0,0,0,15.94,5.19Zm-.25,2h-11V5.69h11Zm-11,7.5v-7h11v7Zm.57-8.08a.23.23,0,0,1-.08-.17.25.25,0,0,1,.08-.18.26.26,0,0,1,.35,0,.25.25,0,0,1,.08.18.28.28,0,0,1-.25.25A.23.23,0,0,1,5.26,6.61Zm1,0a.23.23,0,0,1-.08-.17.25.25,0,0,1,.08-.18.26.26,0,0,1,.35,0,.24.24,0,0,1,.07.18.22.22,0,0,1-.07.17.23.23,0,0,1-.17.08A.23.23,0,0,1,6.26,6.61Zm1,0a.22.22,0,0,1-.07-.17.24.24,0,0,1,.07-.18.26.26,0,0,1,.35,0,.25.25,0,0,1,.08.18.23.23,0,0,1-.08.17.23.23,0,0,1-.18.08A.23.23,0,0,1,7.26,6.61Zm4.4,1.93L9.16,14a.25.25,0,0,1-.22.15.23.23,0,0,1-.11,0,.25.25,0,0,1-.12-.33l2.5-5.5a.25.25,0,0,1,.45.21ZM8.13,9.6,6.77,11.19l1.36,1.58a.25.25,0,0,1-.19.42.25.25,0,0,1-.19-.09l-1.5-1.75a.26.26,0,0,1,0-.33l1.5-1.75a.25.25,0,0,1,.38.33Zm6,1.42a.26.26,0,0,1,0,.33l-1.5,1.75a.25.25,0,0,1-.19.09.25.25,0,0,1-.19-.42l1.36-1.58L12.26,9.6a.25.25,0,0,1,.38-.33Z"/>' +
                '</svg>'
        }
    }

    function validar_variable_cache(dataset) {
        try {
            datos_cache = JSON.parse(atob(data.traer_descripcion_dataset[dataset].result.resources[0].description.replace(/"/g, "")))
            data.traer_descripcion_dataset[dataset].result.name = datos_cache.title_ckan;
            data.traer_descripcion_dataset[dataset].result.notes = datos_cache.descripcion_datamart_ckan;
            if (datos_cache.descripcion_datamart_ckan != undefined) {
                data.traer_descripcion_dataset[dataset].result.notes = datos_cache.descripcion_datamart_ckan;
            }
            else if (datos_cache['descripciýn_datamart_ckan'] != undefined) {
                data.traer_descripcion_dataset[dataset].result.notes = datos_cache['descripciýn_datamart_ckan'];
            }
            else {
                data.traer_descripcion_dataset[dataset].result.notes = 'This dataset has no description';
            }
        }
        catch (error) {
            console.log(dataset)
            data.traer_descripcion_dataset[dataset].result.name = dataset.replace(/_/g, " ").replace(/dm /g, " ");
            data.traer_descripcion_dataset[dataset].result.notes = 'This dataset has no description';
        }
    }

    function cambiar_pestana(opcion_pestana) {
        if (data.traer_descripcion_dataset[atob(opcion_pestana[1])] != undefined) {
            if (!v_data_i_d) {
                v_data_i_d = true;
                data_i_d = data.traer_descripcion_dataset[atob(opcion_pestana[1])];
                data_i_d.opcion = opcion_pestana[2];
                $(".seccion_home").fadeOut()
                inicio_i_d(v_info);
                $(".home_title").animate({ 'opacity': 1 })
            }
        }
    }
})
