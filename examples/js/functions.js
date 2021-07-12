function peticion(url,send,metod,async){
    var respuesta = new XMLHttpRequest();
    respuesta.onreadystatechange = function() {};
    respuesta.open(metod, url, async);
    respuesta.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    respuesta.send(send);
    if(respuesta.status == 200 && respuesta.readyState == 4){
        return respuesta.responseText;
    }
    else{
        return 'Error conexión incorrecta detalles: <br><br> '+ respuesta.responseText 
    }
}