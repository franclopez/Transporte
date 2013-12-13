$(function() {
                    
                    
                        // Definicion de variables
                        var globalUserName = $('#formLogin').find('[name="txtUserName"]');
                        var globalUserPass = $('#formLogin').find('[name="txtPassword"]');
                        var globalValorTiquete;
                    
                        // Inicio conexion con kinvey BackEnd
                           var  promiseInit = Kinvey.init({
                                appKey    : 'kid_eVhkjsgCKO',
                                appSecret : 'e0c62b4ab75043b1934d42891f1ac54f'
                            });
                            
                            promiseInit.then(function(activeUser) {
                                var promisePing = Kinvey.ping();
                                promisePing.then(function(response) {
                                  console.log('Kinvey Ping Success. Kinvey Service is alive, version: ' + response.version + ', response: ' + response.kinvey);
                                }, function(error) {
                                  console.log('Kinvey Ping Failed. Response: ' + error.description);
                                });
                            }, function(error) {
                               loginError.text('Problemas conectando con el backend. Por favor intente mas tarde');
                            });
                            
                        
                        //  Logueo(Submit del formulario de logueo)
                            var loginForm = $('#formLogin');
                            var loginError =  $('#txtMensaje');
                            
                            console.log("Log In");
                            
                            loginForm.on('submit', function(e) {
                                
                                e.preventDefault();
                                loginError.text('');
                                
                                //flood control
                                if(loginForm.hasClass('loading')) {
                                    return false;
                                }
                                
                                loginForm.addClass('loading');
                                
                                
                                var username = $.trim(globalUserName.val()); 
                                var password = $.trim(globalUserPass.val());
                                
                                console.log(username);
                                console.log(password);
                                
                                var user = Kinvey.getActiveUser();
                            
                            //  Desconecto el usuario
                                if (user !== null){
                                    Kinvey.User.logout({
                                        success: function() {
                                            $.mobile.changePage('index.html'); 
                                        },
                                        error: function(e) {
                                            $.mobile.changePage('index.html'); 
                                        }
                                    });
                                }
                                
                            //  Conecto nuevamente el usuario  
                        		Kinvey.User.login(username, password, {
                					success: function() {
                						loginForm.removeClass('loading');
                						$.mobile.changePage('menu.html'); //change to menu page
                					},
                					error: function(error){
                						console.log(error);
                						loginForm.removeClass('loading');
                						loginError.text('Ingrese un usuario y contraseÃ±a validos');
                					}
                				});
                				
                                return false;
                            });
                            
                            // Acciones sobre pantalla Menu
                    		$(document).on("pageinit", "#Menu", function () {
                				var user = Kinvey.getActiveUser();
                				console.log(user);               
                			});
                            
                            //Consulto los datos del usuario de la tarjeta
                            $(document).on("pageshow", "#Tarjeta", function () {
                                
                                // Capturo el usuario
                                var username = $.trim(globalUserName.val());
                                
                                // Armo el query para el saldo disponible
                                var query = new Kinvey.Query();
                                query.ascending('userID');
                                query.equalTo('userID', username);
                                
                                // Extraigo la informaciÃ²n
                                var promiseUserData = Kinvey.DataStore.find('UserData', query , {
                                    
                                   success: function(items){
                                       console.log('todo bien parce!');
                                       $.each(items, function(index, item) {
                                           console.log('El saldo del usuario es: ' + item.userSaldo );
                    					  $('#txtSaldoUser').html('<center><p><b>SALDO DISPONIBLE</b><br>' + '$ ' + item.userSaldo + '</center>');
                					   });
                                   },
                                   error: function(error){
                    					console.log('Paila agoniiiia!');
                				    }
                                });
                                
                                // Armo el query para el costo del tiquete
                                query = new Kinvey.Query();
                                query.ascending('paramName');
                                query.equalTo('paramName', 'ValorTiquete');
                                
                                // Extraigo la informaciÃ²n
                                var promiseValorTiquete = Kinvey.DataStore.find('ConfigUtil', query , {
                                    
                                   success: function(items){
                                       console.log('todo bien parce - 2!');
                                       $.each(items, function(index, item) {
                                            globalValorTiquete = item.paramValue;
                                            console.log('El precios del tiquete es: ' + item.paramValue );
                                            $('#txtValorTiquete').html('<center><p><b>$' + globalValorTiquete + '</b></center>');
                                    	  
                					   });
                                   },
                                   error: function(error){
                    					console.log('Paila agoniiiia - 2!');
                				    }
                                });
                			
                                
                                // NavegaciÃ²n del boton presionar aqui para tarjeta
                                var buttonPress = $('#btnPress');
                                $('#btnPress').on('click',function(e){  
                                    
                                    //function onConfirm(button) {
                                        
                                        if($('#cmbMedioPago option:selected').val() == 1){                    
                                            $.mobile.changePage('tarjeta_qr.html');  
                                        }else{
                                            $.mobile.changePage('tarjeta_nfc.html');  
                                        } 
                                    //}
                                    
                                    /*navigator.notification.confirm(
                                            'Se descontara $1300 de tu saldo, esta seguro de continuar?',  // message
                                            onConfirm,              // callback to invoke with index of button pressed
                                            'Aviso',            // title
                                            'Continuar,Cancelar'          // buttonLabels
                                        );*/
                                    
                                                        
                                });
                                
                            });
                            
                            // Cuando carga la pagina Tarjeta NFC
                            $(document).on("pageshow", "#Tarjeta_NFC", function () {
                                
                                var $this = $( this ),
                                theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme,
                    			msgText = 'Esperando escaner...';
                				textVisible = true;
                				textonly = !!$this.jqmData("textonly");
                				html = $this.jqmData("html") || "";
                                
                                $.mobile.loading( 'show', {
                                    text: msgText,
                                    textVisible: textVisible,
                                    theme: theme,
                                    textonly: textonly,
                                    html: html
                                });
                                
                                // Se desaparece luego de 5 seg
                                setTimeout(function() {
                                    $.mobile.loading( 'hide' );
                                    navigator.notification.vibrate(0);
                                    $.mobile.changePage('menu.html');                                
                                 }, 5000);
                                
                            });
                            
                            //Consulto los datos del usuario de la tarjeta
                            $(document).on("pageshow", "#Saldo", function () {
                                
                                // Capturo el usuario
                                var username = $.trim(globalUserName.val());
                                
                                // Armo el query para el saldo disponible
                                var query = new Kinvey.Query();
                                query.ascending('userID');
                                query.equalTo('userID', username);
                                
                                // Extraigo la informaciÃ²n
                                var promiseUserData = Kinvey.DataStore.find('UserData', query , {
                                    
                                   success: function(items){
                                       console.log('todo bien parce!');
                                       $.each(items, function(index, item) {
                                           console.log('El saldo del usuario es: ' + item.userSaldo );
                        				   $('#txtSaldo').val('$ ' + item.userSaldo);
                                           $('#txtSaldo').attr("disabled", "disabled"); 
                					   });
                                   },
                                   error: function(error){
                    					console.log('Paila agoniiiia!');
                				    }
                                });
                                               
                            });
                            
                            //Consulto los datos del usuario de la tarjeta
                            $(document).on("pageshow", "#Pasar", function () {
                                
                                // Capturo el usuario
                                var username = $.trim(globalUserName.val());
                                
                                // Armo el query para el saldo disponible
                                var query = new Kinvey.Query();
                                query.ascending('userID');
                                query.equalTo('userID', username);
                                
                                // Extraigo la informaciÃ²n
                                var promiseUserData = Kinvey.DataStore.find('UserData', query , {
                                    
                                   success: function(items){
                                       console.log('todo bien parce!');
                                       $.each(items, function(index, item) {
                                           console.log('El saldo del usuario es: ' + item.userSaldo );
                            			   $('#txtSaldoPasa').val('$ ' + item.userSaldo);
                                           $('#txtSaldoPasa').attr("disabled", "disabled"); 
                					   });
                                   },
                                   error: function(error){
                    					console.log('Paila agoniiiia!');
                				    }
                                });
                            });	
                            
                            // Evento de seleccion de metodo de tranferencia
                            $('#cmbMetodoTranfer').change(function() {
                            
                                // si es 1 entonces es de movil a movil, si es 2 es de movil a tarjeta y quita el campo nro de tarjeta
                                if(this.value == 1){
                                    $('#txtNroTarjetaPasa').parent().show();
                                }else{
                                    $('#txtNroTarjetaPasa').parent().hide();
                                }
                            
                            });
                            
                            $( "#btnPasarSaldo" ).click(function() {
                                
                                if($('#cmbMetodoTranfer option:selected').val() == 1){
                                    $.mobile.changePage('menu.html');  
                                }else{
                                    $.mobile.changePage('pasar_nfc.html');  
                                }
                            });
                            
                             // Cuando carga la pagina Tarjeta NFC
                            $(document).on("pageshow", "#Pasar_NFC", function () {
                                
                                var $this = $( this ),
                                theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme,
                        		msgText = 'Esperando tarjeta...';
                				textVisible = true;
                				textonly = !!$this.jqmData("textonly");
                				html = $this.jqmData("html") || "";
                                
                                $.mobile.loading( 'show', {
                                    text: msgText,
                                    textVisible: textVisible,
                                    theme: theme,
                                    textonly: textonly,
                                    html: html
                                });
                                
                                // Se desaparece luego de 5 seg
                                setTimeout(function() {
                                    $.mobile.loading( 'hide' );
                                    $.mobile.changePage('menu.html');                      
                                 }, 5000);
                                
                            });
                            
                         // Cuando carga la pagina Tarjeta NFC
                            $( "#btnPagarBanco" ).click(function() {
                                if($('#txtValorRecarga').text() < 1){
                                    alert('Debe ingresar una valor de recarga ')
                                }else{
                                    $.mobile.changePage('recarga_bancolombia.html');  
                                }
                               
                            });
                            
                            
                });

function btnPasarOnClick(){
    if($('#cmbMetodoTranfer option:selected').val() == 1){
        $.mobile.changePage('menu.html');  
    }else{
        $.mobile.changePage('pasar_nfc.html');  
    }
    
}