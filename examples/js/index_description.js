var data_i_d = {};
var texto_cambio = { txt: "", estado: false, setInterval: 0 }
var v_info_i_d = {};

function inicio_i_d(v_info) {
    texto_cambio.setInterval = setInterval(cambiar_titulo, 50);
    v_info_i_d = v_info;
    console.log(data_i_d.result.resources[0])
    data_i_d.result.resources[0].url = JSON.parse(atob(data_i_d.result.resources[0].description)).url_tablero
    console.log(data_i_d.result.resources[0].url)

    acciones();
}

function cambiar_titulo() {
    if ($(".title").html().length > 0 && !texto_cambio.estado) {
        $(".title").html(
            $(".title").html().substr(0, ($(".title").html().length) - 1)
        );
    }
    else if ($(".title").html().length < data_i_d.result.name.length) {
        texto_cambio.estado = true;
        $(".title").html(
            data_i_d.result.name.substr(0, $(".title").html().length + 1)
        );
    }
    else {
        clearInterval(texto_cambio.setInterval)
        cambiar_textos()
    }
}

function cambiar_textos() {
    $('.frame_descripcion, .frame_tablas, .frame_formats').hide()
    $('.frame_descripcion, .frame_tablas, .frame_formats').css({ 'opacity': '0' })

    if (data_i_d.opcion == 5) {
        $('.frame_descripcion, .frame_tablas').css({ 'padding': '0' });
        $('.iframe_detalles').css({ 'margin': '0' });
    }
    else {
        $('.frame_descripcion, .frame_tablas').css({ 'padding-left': '50px', 'padding-right': '50px', 'padding-bottom': '50px' });
        $('.iframe_detalles').css({ 'margin': '40px' });
    }

    if (data_i_d.opcion == 1) {
        console.log(data_i_d.result.resources[0].description)
        console.log( JSON.parse(atob(data_i_d.result.resources[0].description)) )
        try {
            $('.frame_descripcion_text').html(JSON.parse(atob(data_i_d.result.resources[0].description)).descripciýn_datamart_ckan);
        }
        catch (e) {
            $('.frame_descripcion_text').html(JSON.parse(data_i_d.result.resources[0].description).descripciýn_datamart_ckan);
        }
        $('.frame_resources').html('')

        for (i = 0; i < data_i_d.result.resources.length; i++) {
            $(".frame_etiqueta_text").html(data_i_d.result.resources[i].name)
            /*$('.frame_resources').append(
                '<span class="frame_etiqueta_formar">'+data_i_d.result.resources[i].format+'</span>'+
                '<span class="frame_etiqueta_text"> '+data_i_d.result.resources[i].name+'</span>'+
                '<hr>'
            );*/
        }

        $('.frame_subtitulo_text_1').html(data_i_d.result.last_modified == null ? data_i_d.result.metadata_modified.substr(0, 10) : data_i_d.result.last_modified)
        $('.frame_subtitulo_text_3').html(data_i_d.result.organization.title)
        //------------------------------------------------------------------------------
        $('.informacion_texto_1').html(data_i_d.result.id)
        $('.informacion_texto_2').html(data_i_d.result.metadata_created.substr(0, 10))
        $('.informacion_texto_3').html(data_i_d.result.metadata_modified.substr(0, 10))

        $('.frame_contenedor_4').hide();
        $('.frame_contenedor_5').hide();
        $('.frame_contenedor_6').hide();
        $('.frame_contenedor_7').hide();
        $('.frame_contenedor_8').hide();
        $('.frame_contenedor_9').hide();
        $('.frame_contenedor_10').hide();

        try {
            datos_cache = JSON.parse(atob(data_i_d.result.resources[0].description.replace(/"/g, "")))
            if (datos_cache.pregunta_fundamental != '') {
                $('.informacion_texto_4').html(datos_cache.pregunta_fundamental)
                $('.frame_contenedor_4').fadeIn();
            }

            if (datos_cache.nivel != '') {
                $('.informacion_texto_5').html(datos_cache.nivel)
                $('.frame_contenedor_5').fadeIn();
            }

            if (datos_cache.source_1 != "") {
                $('.informacion_texto_6').html('<a href="' + datos_cache.source_1 + '">Source 1</a>')
                $('.frame_contenedor_6').fadeIn();
            }
            if (datos_cache.source_2 != "") {
                $('.informacion_texto_7').html('<a href="' + datos_cache.source_2 + '">Source 2</a>')
                $('.frame_contenedor_7').fadeIn();
            }
            if (datos_cache.source_3 != "") {
                $('.informacion_texto_8').html('<a href="' + datos_cache.source_3 + '">Source 3</a>')
                $('.frame_contenedor_8').fadeIn();
            }
            if (datos_cache.source_4 != "") {
                $('.informacion_texto_9').html('<a href="' + datos_cache.source_4 + '">Source 4</a>')
                $('.frame_contenedor_9').fadeIn();
            }
            if (datos_cache.source_5 != "") {
                $('.informacion_texto_10').html('<a href="' + datos_cache.source_5 + '">Source 5</a>')
                $('.frame_contenedor_10').fadeIn();
            }

        }
        catch (error) {

        }

        if (data_i_d.result.resources.length == 1) {
            $('.linkc_csv').click(function () {
                console.log("asdsd")
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?bom=True')
            })
            $('.linkc_tsv').click(function () {
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?bom=True&format=tsv')
            })
            $('.linkc_json').click(function () {
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?format=json')
            })
            $('.linkc_xml').click(function () {
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?format=xml')
            })
        }
        else {
            $('.frame_contenedor_11').hide();
        }

        $('.frame_descripcion').show()
        if ($('.detalles_pestanas').css('opacity') == 1) {
            $('.frame_descripcion').animate({ 'opacity': '1' }, 1000)
        }
        else {
            $('.frame_descripcion').delay(1500).animate({ 'opacity': '1' }, 1000)
        }

    }
    else if (data_i_d.opcion == 2 || data_i_d.opcion == 3 || data_i_d.opcion == 4) {
        frame_opcion_temporal = parseInt(data_i_d.opcion) - 1;
        $('.frame_tablas').html('<iframe class="iframe_detalles" height="' + $(document).height() + 'px" src="' + v_info_i_d.ip + '/dataset/' + data_i_d.result.title + '/resource/' + data_i_d.result.resources[0].id + '/view/a56195aa-e985-4389-886d-1a8395615a0b?admin=0&elkin_var=' + frame_opcion_temporal + '" frameBorder="0"></iframe>')
        $('.frame_tablas').fadeIn()

        $('.frame_tablas').show()
        if ($('.detalles_pestanas').css('opacity') == 1) {
            $('.frame_tablas').animate({ 'opacity': '1' }, 1000)
        }
        else {
            $('.frame_tablas').delay(1500).animate({ 'opacity': '1' }, 1000)
        }
    }
    else if (data_i_d.opcion == 5) {
        frame_opcion_temporal = parseInt(data_i_d.opcion) - 1;
        if (data_i_d.result.resources[0].url.split('tableau').length > 1) {
            //$('.frame_tablas').html('<iframe class="iframe_detalles" width="100%" height="'+$(document).height()+'px" src="'+data_i_d.result.resources[0].url+'&:embed=yes&:tabs=yes&:toolbar=yes" frameBorder="0"></iframe>')
            $('.frame_tablas').html("<div class='tableauPlaceholder' id='viz1605711408523' style='position: relative'><noscript><a href='http:&#47;&#47;localhost:3002&#47;'><img alt=' ' src='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;CO&#47;" + data_i_d.result.resources[0].url.split('views/')[1].split('?')[0].replace("/", "&#47;") + "&#47;1_rss.png' style='border: none' /></a></noscript><object class='tableauViz'  style='display:none;'><param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' /> <param name='embed_code_version' value='3' /> <param name='site_root' value='' /><param name='name' value='" + data_i_d.result.resources[0].url.split('views/')[1].split('?')[0].replace("/", "&#47;") + "' /><param name='tabs' value='no' /><param name='toolbar' value='no' /><param name='static_image' value='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;CO&#47;" + data_i_d.result.resources[0].url.split('views/')[1].split('?')[0].replace("/", "&#47;") + "&#47;1.png' /> <param name='animate_transition' value='yes' /><param name='display_static_image' value='yes' /><param name='display_spinner' value='yes' /><param name='display_overlay' value='yes' /><param name='display_count' value='yes' /><param name='origin' value='viz_share_link' /><param name='origin' value='viz_share_link' /><param name='language' value='en' /></object></div>                <script type='text/javascript'>                    var divElement = document.getElementById('viz1605711408523');                    var vizElement = divElement.getElementsByTagName('object')[0];                    if ( divElement.offsetWidth > 800 ) { vizElement.style.width='100%';vizElement.style.height=(divElement.offsetWidth*0.75)+'px';} else if ( divElement.offsetWidth > 500 ) { vizElement.style.width='100%';vizElement.style.height=(divElement.offsetWidth*0.75)+'px';} else { vizElement.style.width='100%';vizElement.style.height='768px';} var scriptElement = document.createElement('script');                    scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';vizElement.parentNode.insertBefore(scriptElement, vizElement);</script>")
        } else {
            $('.frame_tablas').html('<div style="margin-top: 40px;text-align: center;">There is no information to display on this page</div>')
        }

        $('.frame_tablas').fadeIn()

        $('.frame_tablas').show()
        if ($('.detalles_pestanas').css('opacity') == 1) {
            $('.frame_tablas').animate({ 'opacity': '1' }, 1000)
        }
        else {
            $('.frame_tablas').delay(1500).animate({ 'opacity': '1' }, 1000)
        }
    }
    else if (data_i_d.opcion == 6) {
        $(".frame_formats").show();
        if ($('.detalles_pestanas').css('opacity') == 1) {
            $('.frame_formats').animate({ 'opacity': '1' }, 1000)
        }
        else {
            $('.frame_formats').delay(1500).animate({ 'opacity': '1' }, 1000)
        }

        if (data_i_d.result.resources.length == 1) {
            $('.linkc_csv').click(function () {
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?bom=True')
            })
            $('.linkc_tsv').click(function () {
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?bom=True&format=tsv')
            })
            $('.linkc_json').click(function () {
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?format=json')
            })
            $('.linkc_xml').click(function () {
                window.open(v_info_i_d.ip + '/datastore/dump/' + data_i_d.result.resources[0].id + '?format=xml')
            })
        }
    }
    else if (data_i_d.opcion == 7) {
        $('.frame_tablas').html('<iframe class="iframe_detalles" width="100%" height="' + ($(document).height() / 2) + 'px" src="' + v_info_i_d.ip + '/api/3/action/datastore_search?limit=5&resource_id=' + data_i_d.result.resources[0].id + '" frameBorder="0"></iframe>')

        $('.frame_tablas').append(
            '<hr><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1630.89 80.25">' +
            '<path class="url_api1" d="M1619.36.5H11.53a11,11,0,0,0-11,11V68.72a11,11,0,0,0,11,11H1619.36a11,11,0,0,0,11-11V11.53a11,11,0,0,0-11-11"/>' +
            '<rect class="url_api2" x="0.5" y="0.5" width="1629.89" height="79.25" rx="11.03"/>' +
            '<path class="url_api3" d="M1619.36.5h-68.22V79.75h68.22a11,11,0,0,0,11-11V11.53a11,11,0,0,0-11-11"/>' +
            '<path class="url_api4" d="M1619.36.5h-68.22V79.75h68.22a11,11,0,0,0,11-11V11.53A11,11,0,0,0,1619.36.5Z"/>' +
            '<path class="url_api1" d="M1585.69,43.49c3.3,7.51,12.33,8.29,18,3,3.47-3.24,6.81-6.7,10.11-10.12a10.39,10.39,0,0,0-.13-14.69,10.72,10.72,0,0,0-1.72-1.36c-3.09-2-7.26-2.91-10.73-1.43s-6.19,5.28-8.74,7.82c-2.23,2.25,1.24,5.78,3.5,3.5,3.78-3.77,7.67-9.77,13.5-5.59a5.44,5.44,0,0,1,1.46,7.56l-.09.14a24,24,0,0,1-2.08,2.08c-2.56,2.57-5.11,5.16-7.71,7.71-3.62,3.58-8.7,4.24-11.09-1.14-1.31-2.91-5.55-.4-4.27,2.49"/>' +
            '<path class="url_api1" d="M1595.83,36.75c-3.3-7.5-12.32-8.29-18-3-3.45,3.23-6.81,6.71-10.11,10.11a10.39,10.39,0,0,0,.14,14.7,10.57,10.57,0,0,0,1.7,1.36c3.09,2,7.26,2.91,10.74,1.42s6.19-5.27,8.73-7.81c2.26-2.26-1.24-5.75-3.49-3.5-3.78,3.76-7.68,9.77-13.51,5.61a5.45,5.45,0,0,1-1.48-7.55l.12-.18a22.58,22.58,0,0,1,2.08-2.07c2.56-2.57,5.11-5.17,7.7-7.71,3.63-3.56,8.71-4.24,11.09,1.14,1.32,2.91,5.55.39,4.27-2.5"/>' +
            '<text class="url_api5" transform="translate(32 49.75)">' + v_info_i_d.ip + '/api/3/action/datastore_search?limit=5&resource_id=' + data_i_d.result.resources[0].id + '</text>' +
            '</svg>'
        )

        $('.frame_tablas').fadeIn()

        $('.frame_tablas').show()
        if ($('.detalles_pestanas').css('opacity') == 1) {
            $('.frame_tablas').animate({ 'opacity': '1' }, 1000)
        }
        else {
            $('.frame_tablas').delay(1500).animate({ 'opacity': '1' }, 1000)
        }

        $('.url_api3').click(function () {
            input = document.createElement("input");
            input.id = 'input_temporal'
            input.setAttribute("value", v_info_i_d.ip + '/api/3/action/datastore_search?limit=5&resource_id=' + data_i_d.result.resources[0].id);
            $('.body').append(input)
            input.select();
            document.execCommand("copy");
            alert("Enlace copiado")
        });
    }

    $('.pestana').css({
        'fill': '#dadada', 'stroke': '#dadada'
    })

    $('.relleno').css({
        'fill': '#878787'
    })

    $('.borde').css({
        'stroke': '#878787'
    })

    //----------------------------

    $('.cuadro_' + data_i_d.opcion + ' .pestana').css({
        'fill': '#16747a', 'stroke': '#16747a'
    })

    $('.cuadro_' + data_i_d.opcion + ' .relleno').css({
        'fill': 'white'
    })

    $('.cuadro_' + data_i_d.opcion + ' .borde').css({
        'stroke': 'white'
    })

    $('.detalles_pestanas').delay(500).animate({ 'opacity': '1' }, 1000)

    texto_tempora = '';
    if (data_i_d.opcion == 1) { texto_tempora = '<a href="#" class="atras">Datasets/</a>/Information'; }
    if (data_i_d.opcion == 2) { texto_tempora = '<a href="#" class="atras">Datasets/</a>Tables'; }
    if (data_i_d.opcion == 3) { texto_tempora = '<a href="#" class="atras">Datasets/</a>Maps'; }
    if (data_i_d.opcion == 4) { texto_tempora = '<a href="#" class="atras">Datasets/</a>Visualization'; }
    if (data_i_d.opcion == 5) { texto_tempora = '<a href="#" class="atras">Datasets/</a>Dashboard'; }
    if (data_i_d.opcion == 6) { texto_tempora = '<a href="#" class="atras">Datasets/</a>Export'; }
    if (data_i_d.opcion == 7) { texto_tempora = '<a href="#" class="atras">Datasets/</a>API'; }
    $('.dir').html(texto_tempora)

    $('.atras').click(function () {
        window.location = window.location.origin + window.location.pathname
        //location.reload();
    })
}

function acciones() {
    if (data_i_d.result.resources[0].url.split('tableau').length > 1 && data_i_d.result.resources[0].mapas) {
        $('.detalles_pestanas').html(traer_svg(1))
    }
    else if (data_i_d.result.resources[0].url.split('tableau').length > 1 && !data_i_d.result.resources[0].mapas) {
        $('.detalles_pestanas').html(traer_svg(2))
    }
    else if (data_i_d.result.resources[0].url.split('tableau').length < 2 && !data_i_d.result.resources[0].mapas) {
        $('.detalles_pestanas').html(traer_svg(3))
    }
    else {
        $('.detalles_pestanas').html(traer_svg(4))
    }

    $(".seccion_descripcion").fadeIn()
    $('.cuadro_1, .cuadro_2, .cuadro_3, .cuadro_4, .cuadro_5, .cuadro_6, .cuadro_7').click(function () {
        data_i_d.opcion = this.classList[0].split("_")[1]
        cambiar_textos();
    })
    $('.home_title').html(
        '<a href="' + window.location.origin + window.location.pathname + '">Datasets</a>/' + data_i_d.result.name
    )
}
