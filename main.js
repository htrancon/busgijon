        //vbles globales
        var map;
        var markers=[];
        var infowindows=[];
        var path=[];
        var user;
        var sexo;
         
        var maxbuses=200;//numero de buses variable
        path=new Array(maxbuses);
        for (var i=0;i<maxbuses; i++) path[i] = new Array(2);
        
        //inicializamos vector de lineas de bus
        var nlineas=40;
        var lineas=new Array(); //muchas posiciones del array no corresponden con nada
        for (var i=0;i<nlineas; i++) lineas[i] = 0;
        
        function initialize() { //w3c 
          
          var mapProp = {
            center:new google.maps.LatLng(43.53,-5.66), //coordenadas gijon
            zoom:13,
            mapTypeId:google.maps.MapTypeId.ROADMAP,
            /*panControl:true,
            zoomControl:true,
            mapTypeControl:true,
            scaleControl:true,
            streetViewControl:true,
            overviewMapControl:true,
            rotateControl:true*/
          };
        
        map=new google.maps.Map(document.getElementById("Mapa"), mapProp);
        }
        
        google.maps.event.addDomListener(window, 'load', initialize);

        function llamada(){
            
            $.ajax({ //llamada ajax
								
              url: 'http://curso-js-2014.herokuapp.com/busgijon',
              type: 'GET',
              timeout: 5000,
		
              success: function (response){

                procesardatos(response)       
			  },
								
              failure: function (error){
				alert('entramos en failure');
			  }
          });//ajax
            
        }
                  
        function procesardatos(data){
            
            //console.log(data);
         
            deleteMarkers();
            var nbuses = data.posiciones.posicion.length;
            markers = new Array(nbuses);
            infowindows = new Array(nbuses);
            
            
            for(i = 0; i < nbuses; i++){
                
                markers[i] = new google.maps.Marker({ position: new google.maps.LatLng(0,0),});    
                infowindows[i] = new google.maps.InfoWindow({content:""});
                
                var grid = new Utm(30, 'N', data.posiciones.posicion[i].utmx, data.posiciones.posicion[i].utmy); //zona y hemisferios de gijon
                var latlong = grid.toLatLonE(); //biblioteca extra
                
                var parts = latlong.toString().split(/[^\d\w]+/);
                var latDD = ConvertDMSToDD(parseInt(parts[0]), parseInt(parts[1]),parseInt(parts[2]), parts[3]);
                var lngDD = ConvertDMSToDD(parseInt(parts[4]), parseInt(parts[5]),parseInt(parts[6]), parts[7]);
            
                if(lineas[data.posiciones.posicion[i].idlinea]){
                    var current= new google.maps.LatLng(latDD,lngDD);
                  }

                else { var current = new google.maps.LatLng(0,0);}

                markers[i].setPosition(current);
                elegirDibujos(data.posiciones.posicion[i].idlinea);
                //markers[i].setOptions({icon: "pinkball.png" });
                markers[i].setMap(map);
                
                /*infowindows[i].content="Faltan " + data.posiciones.posicion[i].minutos + 
                              " minutos para que el coche con matricula " + data.posiciones.posicion[i].matricula +
                              " llegue a la parada de la linea " + data.posiciones.posicion[i].idlinea;
                                
                var aux=infowindows[i];                
                //que haser si nos clikan ensima wei
                google.maps.event.addListener(markers[i],'click',function() {
                    aux.open(map,markers[i]);*/
                
                /*path[i].push(current);
                alert(path[i]);
                var busPath=new google.maps.Polyline({
                  path:path[i],
                  strokeColor:"#0000FF",
                  strokeOpacity:0.8,
                  strokeWeight:2
                });

                busPath.setMap(map);*/
                            
            }
        }

        // Deletes all markers in the array by removing references to them.
        function deleteMarkers() {
            for (var i = 0; i < markers.length; i++)
                markers[i].setMap(null);
          
            markers = [];
        }

        
        function ConvertDMSToDD(degrees, minutes, seconds, direction) {
            var dd = degrees + minutes/60 + seconds/(60*60);

            if (direction == "S" || direction == "W") {
                dd = dd * -1;
            } // Don't do anything for N or E
            return dd;
        }
        
        //marcamos en el vector de lineas las lineas seleccionadas
        function SetLinea(linea){
            
            if(linea==0 && lineas[39]==0){ //todas
                for (var j=0;j<nlineas; j++) lineas[j] +=1; 
            }
            else if(linea==0 && lineas[39]==1){ //todas
                for (var j=0;j<nlineas; j++) lineas[j] -=1; 
            }
            
            else if(lineas[linea]==0) lineas[linea]+=1; //anteriormente linea false
            else lineas[linea]-=1; //anteriormente linea true
            
            llamada();
            setCookie(user, sexo, pokeball, lineas);
        }
        
        var pokeball=0;
        
        function SetPokeball(id){ 
            
            pokeball=id;
            setCookie(user, sexo, pokeball, lineas);
        }
        
        function elegirDibujos(nlinea){
            
            if (pokeball!=0) nlinea=pokeball;
            
            switch(nlinea) {
                
                case -3:
                    markers[i].setOptions({icon: "masterball.jpg" });
                    break;
                case -2:
                    markers[i].setOptions({icon: "pinkball.png" });
                    break;
                case -1:
                    markers[i].setOptions({icon: "pokeball.png" });
                    break;        
                    
                default:markers[i].setOptions({icon: ""+nlinea.toString()+".png" });
            }
                
        }
        
        function createCookie(){

            user = document.getElementById('nombre').value;
            sexo = document.getElementById('sexo').value;

            if (user != "" && user != null) {
               setCookie(user, sexo, pokeball, lineas);
            }        
        }

        function setCookie(cuser,csexo,cpokeball,clineas) {
            
            var d = new Date();
            var exdays=30;
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires=" + d.toGMTString();
            
            var aux=lineas.toString();
            var find = ',';
            var re = new RegExp(find, 'g');
            var clineas=aux.replace(re,":");
            //$.cookie('clineas', aux);

            document.cookie = "username="+cuser+",sexo="+csexo+",pokeball="+cpokeball+",lineas="+clineas+";"+expires;
            //alert(cname+"="+cvalue+"; "+expires);
            //alert(document.cookie);
        }

        function getCookie() {
            
            var name = "username=";
            var sex = "sexo=";
            var pokeball = "pokeball=";
            var lineas = "lineas=";
            var answer = [];
                    
            var ca = document.cookie.split(',');
            
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) {
                    answer.push(c.substring(name.length, c.length));
                }
                if (c.indexOf(sex) == 0) {
                    answer.push(c.substring(sex.length, c.length));
                }
                if (c.indexOf(pokeball) == 0) {
                    answer.push(c.substring(pokeball.length, c.length));
                }
                if (c.indexOf(lineas) == 0) {
                    answer.push(c.substring(lineas.length, c.length));
                }
            }

            if (answer!=""){
                return answer;
            }
            else return "";
        }

        function checkCookie() {
            
            var resp=getCookie();
            
            //var parseoraro;
            
            if(resp!=""){
                user=resp[0];
                sexo=resp[1];
                pokeball=parseInt(resp[2]);
                //parseoraro=resp[3];
                var aux=resp[3].split(':');
                for(var i=0;i<aux.length;i++){
                    lineas[i]=parseInt(aux[i]);
                }

            //}
            
            var bodywelcome = document.getElementById('welcomeuser');
            
            if(sexo=="hombre") var html="<h1> Bienvenido "+user+"</h1>";
            else if(sexo=="mujer") var html="<h1> Bienvenida "+user+"</h1>";
            else var html="<h1> Welcome stallion</h1>";
            
            bodywelcome.innerHTML=html;
                
            }
            
            if (resp != "") {
                $('#modalWelcome').modal('show');
                marcarCheckboxes();
                llamada();
            } else {
               $('#modalLogin').modal('show');    
            }
        }
        
        function marcarCheckboxes(){
            
            for(var k=0;k<lineas.length;k++){
                if(lineas[k]>0) $("#1").attr("ckecked",true);
            }            
            
        }

        $('#cookies').click(function () {
             
             $('#modalLogin').modal('show');
        });

        setInterval(function(){llamada()},6000); // cada 6000 ms se hace una peticion
