var app = angular.module('hushaBaby', ['ionic', 'ksSwiper', 'ngSanitize','services'])

app.run(function($ionicPlatform, AdMob) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    /*------------------------------------------------------------------------------------------------------------
    APP RATING STARTS
    ------------------------------------------------------------------------------------------------------------*/
    AppRate.preferences.useLanguage = 'en';
    var popupInfo = {};
    popupInfo.title = "Rate Husha Baby";
    popupInfo.message = "You like Husha Baby? We would be glad if you share your experience with others. Thanks for your support!";
    popupInfo.cancelButtonLabel = "No, thanks";
    popupInfo.laterButtonLabel = "Remind Me Later";
    popupInfo.rateButtonLabel = "Rate Now";
    AppRate.preferences.customLocale = popupInfo;
    AppRate.preferences.openStoreInApp = true;
    //AppRate.preferences.storeAppURL.ios = '849930087';
    AppRate.preferences.storeAppURL.android = 'market://details?id=com.hushababy799427';
    AppRate.preferences.usesUntilPrompt = 3;
    AppRate.promptForRating(false);
  /*------------------------------------------------------------------------------------------------------------
    ADMOB STARTS
  ------------------------------------------------------------------------------------------------------------*/
      var admobid = {};
        // select the right Ad Id according to platform
        if( /(android)/i.test(navigator.userAgent) ) { 
            admobid = { // for Android
                banner: 'ca-app-pub-7481520988073271/4737119543',
                interstitial: 'ca-app-pub-6869992474017983/1657046752'
            };
        } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
            admobid = { // for iOS
                banner: 'ca-app-pub-7481520988073271/4737119543',
                interstitial: 'ca-app-pub-6869992474017983/7563979554'
            };
        } else {
            admobid = { // for Windows Phone
                banner: 'ca-app-pub-7481520988073271/4737119543',
                interstitial: 'ca-app-pub-6869992474017983/1355127956'
            };
        }

  if(window.AdMob) AdMob.createBanner( {
      adId:admobid.banner, 
      position:AdMob.AD_POSITION.BOTTOM_CENTER, 
      autoShow:true} );
      
 AdMob.init();
  
/*------------------------------------------------------------------------------------------------------------
    ANALYTICS STARTS
------------------------------------------------------------------------------------------------------------*/
  if(typeof analytics !== "undefined") {
      analytics.startTrackerWithId("UA-89169195-1");
      //analytics.startTrackerWithId("UA-XXXXXXXX-XX");
  } else {
      console.log("Google Analytics Unavailable");
  }
})
 });
/*------------------------------------------------------------------------------------------------------------
    APP CONFIG STARTS
    ------------------------------------------------------------------------------------------------------------*/
app.config(function($stateProvider, $urlRouterProvider) {
   $stateProvider
   .state('home', {url: '/', templateUrl: 'templates/home.html', controller: 'HomeCtrl'})
   .state('play', { url: '/play', templateUrl: 'templates/play.html'})
   .state('settings', {url: '/settings', templateUrl: 'templates/settings.html'});
   
   $urlRouterProvider.otherwise("/");
})

/*------------------------------------------------------------------------------------------------------------
    APP CONSTANTS STARTS
    ------------------------------------------------------------------------------------------------------------*/
app.constant('config', {
    paid: false
});

/*------------------------------------------------------------------------------------------------------------
    MAIN CONTROLLER STARTS
    ------------------------------------------------------------------------------------------------------------*/
app.controller('MainCtrl', function($scope, $window, $sce, $state, $interval, $ionicPlatform, config, $ionicPopup, $http, $ionicModal, $timeout, $ionicLoading, AdMob){
  $scope.autoMode = $window.localStorage.autoMode;
  $scope.apiDate = $window.localStorage.apiDate;
  $scope.sunrise = $window.localStorage.sunrise;
  $scope.sunset = $window.localStorage.sunset;
  $scope.isPaid = config.paid = $window.localStorage.isPaid;
  $scope.timer = [0,5,10,15,20,25,30,35,40,45,50,55,60, 75,90,105,120,150,180,999];
  $scope.appTheme = 'day';
  $scope.forceTheme = false;
  var productIds = ['com.pinkbarracuda.hushababy.pro'];
  var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';
  $scope.settingsList = [
    { 
      text: "Auto Dark Mode", 
      checked: $scope.autoMode == 'true' ? true : false, 
      type: "theme",
      desc : "Activated from sunset to sunrise." 
    },{ 
      text: "Keypad sounds", 
      checked: false, 
      type: "sound", 
      desc : "Keypad sounds are off."  
    }
  ];
  $scope.showBanner = function(){
		//console.log(frm);
		var done = AdMob.showBanner();
		if( !done ){
			$ionicPopup.show({
                title: "AdMob is not ready",
                buttons: [
                    {
                        text: 'Got it!',
                        type: 'button-positive',
                        onTap: function (e) {
                        }
                    }
                ]
            })
		}
	}
	/*$scope.removeBanner = function(){
		AdMob.removeAds();
	}*/
  if($scope.isPaid){
    $timeout(function(){
      AdMob.init();
      AdMob.showBanner();
    },550);
  }
  
  

  $scope.loadProducts = function () {
    if(!$scope.isPaid){
      $ionicLoading.show({ template: spinner + 'Loading ...' });
      inAppPurchase
      .getProducts(productIds)
      .then(function (products) {
        $ionicLoading.hide();
        $scope.products = products;
      })
      .catch(function (err) {
        $ionicLoading.hide();
        console.log(err);
      });
    }
  };
  

  $scope.buy = function (productId) {

    $ionicLoading.show({ template: spinner + 'Purchasing...' });
    inAppPurchase
      .buy(productId)
      .then(function (data) {
        console.log(JSON.stringify(data));
        console.log('consuming transactionId: ' + data.transactionId);
        $scope.isPaid = $window.localStorage.isPaid = true;
        return inAppPurchase.consume(data.type, data.receipt, data.signature);
      })
      .then(function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Purchase was successful!',
          template: 'Check your console log for the transaction data'
        });
        console.log('consume done!');
        $ionicLoading.hide();
      })
      .catch(function (err) {
        $ionicLoading.hide();
        console.log(err);
        $ionicPopup.alert({
          title: 'Something went wrong',
          template: 'Check your console log for the error details'
        });
      });

  };

  $scope.restore = function () {
    $ionicLoading.show({ template: spinner + 'Restoring Purchases...' });
    inAppPurchase
      .restorePurchases()
      .then(function (purchases) {
        $ionicLoading.hide();
        $scope.isPaid = $window.localStorage.isPaid = true;
        console.log(JSON.stringify(purchases));
        $ionicPopup.alert({
          title: 'Restore was successful!',
          template: 'Check your console log for the restored purchases data'
        });
      })
      .catch(function (err) {
        $ionicLoading.hide();
        console.log(err);
        $ionicPopup.alert({
          title: 'Something went wrong',
          template: 'Check your console log for the error details'
        });
      });
  };




  $scope.openSettings = function(){
    $state.go('settings');
    $scope.stopTune();
    $scope.loadProducts();
  };
  
  if($scope.autoMode === 'true'){
    if($scope.apiDate !== new Date().toDateString()){
      getWeatherLocation();
    } else {
      checkTheme();
    }
  }
  function getWeatherLocation() {
    navigator.geolocation.getCurrentPosition(onWeatherSuccess, onWeatherError, { enableHighAccuracy: true });
  }
  // Success callback for get geo coordinates

  function onWeatherSuccess(position) {
    console.log(position);
    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;

    getWeather(Latitude, Longitude);
  }

  // Get weather by using coordinates

  function getWeather(latitude, longitude) {
    var queryString = 'http://api.sunrise-sunset.org/json?lat='
                      + latitude + '&lng=' + longitude + '&formatted=0';

    $http.get(queryString).then(function successCallback(response) {
      $scope.apiResp = response.data.results;
      $scope.apiDate = $window.localStorage.apiDate = new Date($scope.apiResp.sunrise).toDateString();
      $scope.sunrise = $window.localStorage.sunrise = new Date($scope.apiResp.sunrise).getTime();
      $scope.sunset = $window.localStorage.sunset = new Date($scope.apiResp.sunset).getTime();
      checkTheme();
    }, function errorCallback(response) {
      console.log(response);
    });
  }
  function onWeatherError(error) {
    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
  }

  function checkTheme(){
     var sysDate = new Date().getTime();
     var sunriseDiff = $scope.sunrise - sysDate;
     var sunsetDiff = $scope.sunset - sysDate;
     if (sunriseDiff <= 0 && sunsetDiff > 0) {
      $scope.appTheme = $window.localStorage.appTheme = 'day';
      setTheme(sunsetDiff, 'night');
     } else {
      $scope.appTheme = $window.localStorage.appTheme = 'night';
      setTheme(sunriseDiff, 'day');
     }
  }
  function setTheme(time, theme){
    if( time > 0 ){
      console.log(time);
      $timeout(function(){
        if(!$scope.forceTheme){
          $scope.appTheme = $window.localStorage.appTheme = theme;
        }
      }, time);
    }
  }
  $scope.themeChanger = function () {
    if($scope.isPaid){
      $scope.forceTheme = true;
      $scope.appTheme = $scope.appTheme == 'night' ? 'day' : 'night';
    } else {
        $scope.showAlert();
    }
  }
    

    $scope.changeSettings = function(item){
      if($scope.isPaid){
        switch(item.type){
          case 'theme':
            $scope.autoMode = $window.localStorage.autoMode = item.checked;
            break;
        }
      } else {
        $scope.showAlert();
        item.checked = false;
      }
      
    }



  var selectedTheme = $window.localStorage.appTheme;
  if (selectedTheme) {
      //$scope.appTheme = selectedTheme;
  } else {
      //$scope.appTheme = 'day';
  }
  $scope.showAlert = function() {
     var alertPopup = $ionicPopup.alert({
       template: 'To access “Dark Mode” you will need to unlock full version.'
     });
     
  }
  
  if(typeof window.analytics !== "undefined") { 
    window.analytics.trackView("Awesome Controller"); 
  } else {
    console.log('Nothing found');
  }


  


  $scope.rateApp = function(){
    AppRate.promptForRating();
  }

  $scope.playSound = function(){
      for(var i = 0; i < $scope.collection.length; i++) {
        if($scope.collection[i].id == $scope.selectedTune){
          $scope.playingTune = $scope.collection[i];
        }
        
      }
      $state.go('play');
      $scope.stopTrack();
      $scope.playTrack($scope.playingTune.audio, $scope.playingTune.id);
      $scope.timeLeft = Number.parseInt($scope.selectedTime) * 60;
      $scope.startTime();
      $scope.trackPlaying = true; 

      cordova.plugins.backgroundMode.setEnabled(true);
      cordova.plugins.backgroundMode.configure({ text : 'App is running in the background' });
      cordova.plugins.backgroundMode.on('activate', function(){
        //$scope.playTrack($scope.playingTune.audio, $scope.playingTune.id);
        cordova.plugins.backgroundMode.wakeUp();
        cordova.plugins.backgroundMode.unlock();
      });
      /*cordova.plugins.backgroundMode.on('activate', function () {
          setInterval(function () {
             $scope.playTrack($scope.playingTune.audio, $scope.playingTune.id);
          }, 1000);
      });*/
      /*if($scope.isPaid){
        cordova.plugins.backgroundMode.enable();
 
        // Called when background mode has been activated
        cordova.plugins.backgroundMode.onactivate = function() {
          // if track was playing resume it
          //if(trackPlaying) {
            $scope.playTrack($scope.playingTune.audio, $scope.playingTune.id);
          //}
        }
      }*/
    }


    


    $scope.swiper = {};
    $scope.selectedTune = 3;
    $scope.selectedTime = 5;


    $scope.onReadySwiper = function (swiper, from) {
        swiper.on('onSlideChangeEnd', function () {
          if(from == 'play')
            $scope.selectedTune = swiper.activeIndex; 
          else {
            $scope.selectedTime = document.getElementsByClassName("swiper-slide-next")[1].getAttribute('data-attr'); 
          }
        });     
    };



    $scope.stopTune = function(){
      $scope.resetTime();
      $scope.stopTrack();
      $state.go('home');
      cordova.plugins.backgroundMode.disable();
      cordova.plugins.backgroundMode.un('EVENT', function(){});
    }

    $ionicPlatform.onHardwareBackButton(function() {
      $scope.stopTune();
      cordova.plugins.backgroundMode.disable();
      cordova.plugins.backgroundMode.un('EVENT', function(){});
    });

    
    

    $scope.collection = [{
      id : 2,
      title : 'fan',
      src : 'Fan',
      audio : 'audio/fan.mp3',
      svg : $sce.trustAsHtml('<svg width="36px" height="50px" viewBox="0 0 36 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>Icn-Fan</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="UI-Guides" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="Iconography" transform="translate(-372.000000, -436.000000)"> <path d="M392.145575,471.873451 C401.075273,470.812828 408,463.215092 408,454 C408,444.058875 399.941125,436 390,436 C380.058875,436 372,444.058875 372,454 C372,463.215092 378.924727,470.812828 387.854425,471.873451 L387,477 L393,477 L392.145575,471.873451 Z M390,470 C398.836556,470 406,462.836556 406,454 C406,445.163444 398.836556,438 390,438 C381.163444,438 374,445.163444 374,454 C374,462.836556 381.163444,470 390,470 Z M393.50198,449.656946 C385.68527,446.516497 386.156845,453.268487 384.781117,450.678097 C383.40539,448.087707 384.659427,443.249651 387.722624,441.409075 C390.785821,439.568498 395.313088,439.659392 397.451122,442.666568 C399.589155,445.673744 397.500471,450.753189 393.50198,449.656946 Z M384.234281,453.653189 C385.857764,461.919244 391.263622,457.846351 389.840413,460.410961 C388.417204,462.97557 383.676671,464.558841 380.464697,462.992277 C377.252724,461.425714 374.863227,457.579324 376.2208,454.148393 C377.578374,450.717462 382.975933,449.702715 384.234281,453.653189 Z M392.12772,459.065699 C398.755784,453.866454 392.672601,450.898854 395.603808,451.002634 C398.535016,451.106414 402.097877,454.611471 402.160264,458.184565 C402.222652,461.757659 399.880301,465.632941 396.206994,465.980944 C392.533687,466.328948 389.1791,461.980372 392.12772,459.065699 Z M390,458 C392.209139,458 394,456.209139 394,454 C394,451.790861 392.209139,450 390,450 C387.790861,450 386,451.790861 386,454 C386,456.209139 387.790861,458 390,458 Z M378.711249,478.886695 C379.070158,477.844702 380.256339,477 381.353506,477 L399.168715,477 C400.269085,477 401.452751,477.846698 401.810972,478.886695 L402.955416,482.209274 C403.676531,484.302834 402.46699,486 400.264272,486 L380.257949,486 C378.050556,486 376.844197,484.307169 377.566805,482.209274 L378.711249,478.886695 Z M394,483 C394,482.447715 394.437881,482 395.002929,482 L399.997071,482 C400.550973,482 401,482.443865 401,483 C401,483.552285 400.562119,484 399.997071,484 L395.002929,484 C394.449027,484 394,483.556135 394,483 Z" id="Icn-Fan"></path> </g> </g> </svg>')
    },{
      id : 3,
      title : 'hair dryer',
      src : 'Hair-Dryer',
      audio : 'audio/hairdryer.mp3',
      svg : $sce.trustAsHtml('<svg width="50px" height="44px" viewBox="0 0 50 44" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 41.2 (35397) - http://www.bohemiancoding.com/sketch --> <title>Icn-Hair-Dryer</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="UI-Guides" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="Iconography" transform="translate(-605.000000, -437.000000)"> <path d="M615.000419,439.536628 C615.000419,439.536628 634.216242,437.194866 642.911676,437.005622 C652.042984,436.806891 654.90479,441.913092 654.997984,446.613288 C655.091178,451.313483 651.937286,455.607917 648.833977,455.607917 C645.370687,455.607917 645.225826,458.668463 645.225826,458.668463 L642.911676,471.687506 C642.911676,471.687506 642.34259,475.719733 639.560681,475.719733 L639.040771,475.719733 L638.194528,480.034722 C638.194528,480.034722 638.036377,481.027381 637.010132,481.027381 C635.983887,481.027381 636.148926,480.034722 636.148926,480.034722 L636.622559,475.719733 L636.044922,475.719733 C634.330566,475.719733 633.570569,474.316901 634.095345,471.687506 C634.445081,469.935156 635.811498,463.62566 635.91701,463.112989 C636.022522,462.600318 634.968018,462.515174 635.041504,462.012245 C635.11499,461.509315 635.291543,460.602673 635.360962,460.215675 C635.453319,459.700798 636.494546,459.993952 636.566202,459.531157 C636.612911,459.229477 636.654569,458.940989 636.690323,458.668463 C637.177195,454.957448 634.970471,455.096198 629.85527,454.476081 C624.740068,453.855963 615.000419,452.536628 615.000419,452.536628 C615.000419,452.536628 609.871857,453.537636 608.120183,454.24195 C606.340328,454.957594 605.05151,454.592292 605.016874,452.536628 C604.982238,450.480963 605.010644,441.555182 605.016874,439.536628 C605.023104,437.518073 606.683152,437.328131 608.120183,437.700202 C609.557213,438.072272 615.000419,439.536628 615.000419,439.536628 Z M615.000419,441.353431 C615.000419,441.353431 634.216242,439.194866 642.911676,439.005622 C644.773434,438.965103 645.393433,439.005622 646.991333,439.394813 C646.991333,439.394813 646.991333,453.673499 646.991333,453.673499 C643.814453,453.673499 643.225826,458.668463 643.225826,458.668463 L640.645691,471.849037 C640.645691,471.849037 640.418823,473.719733 639.003662,473.719733 C637.588501,473.719733 638.927675,473.719733 637.271729,473.719733 C635.615782,473.719733 635.570569,473.316901 636.095345,470.687506 C636.620122,468.058112 638.305574,462.00431 638.792725,458.291175 C639.279597,454.58016 636.897916,453.507484 631.782715,452.887367 C626.667513,452.267249 615.000419,450.975013 615.000419,450.975013 L615.000419,441.353431 Z M648.000557,440.49902 C648.000249,440.222698 648.231934,439.998695 648.5,439.998695 C648.776142,439.998695 649.00025,440.223476 649.000557,440.49902 L649.01458,453.102861 C649.014887,453.379184 648.783203,453.603187 648.515137,453.603187 C648.238994,453.603187 648.014887,453.378406 648.01458,453.102861 L648.000557,440.49902 Z M649.998422,441.501943 C649.999294,441.224007 650.231934,440.998695 650.5,440.998695 C650.776142,440.998695 650.999278,441.229023 650.998422,441.501943 L650.963736,452.565026 C650.962865,452.842963 650.730225,453.068275 650.462158,453.068275 C650.186016,453.068275 649.96288,452.837946 649.963736,452.565026 L649.998422,441.501943 Z M652.00446,443.506244 C652.001997,443.225932 652.231934,442.998695 652.5,442.998695 C652.776142,442.998695 653.001924,443.217647 653.00446,443.506244 L653.057552,449.548519 C653.060015,449.82883 652.830078,450.056068 652.562012,450.056068 C652.285869,450.056068 652.060088,449.837116 652.057552,449.548519 L652.00446,443.506244 Z" id="Icn-Hair-Dryer"></path> </g> </g> </svg>')
    },{
      id : 4,
      title : 'heartbeats',
      src : 'Heart',
      audio : 'audio/heartbeat.mp3',
      svg : $sce.trustAsHtml('<svg width="50px" height="46px" viewBox="0 0 50 46" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 41.2 (35397) - http://www.bohemiancoding.com/sketch --> <title>Icn-Heart</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="UI-Guides" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="Iconography" transform="translate(-127.000000, -436.000000)"> <path d="M151.995945,442.750271 C149.228305,439.7527 147.782644,436 140.07279,436 C132.305201,436 127,442.217591 127,449.859652 C127,452.868196 127.962084,455.730104 129.793998,458.147114 L149.337794,480.891747 C149.937956,481.590016 150.814882,481.994015 151.750608,482 C152.684307,482 153.559205,481.606974 154.163423,480.92267 L173.716342,458.751616 C175.834144,456.263781 177,453.105608 177,449.859652 C177,442.217591 171.692822,436 163.924169,436 C157.413625,436 154.765612,439.7527 151.995945,442.750271 Z M152.632603,479.559049 C152.413625,479.805439 152.097324,479.948085 151.762774,479.948085 L151.762774,480.945613 L151.756691,479.948085 C151.420114,479.94609 151.102798,479.799454 150.885848,479.547079 L131.408962,456.883246 C129.85077,454.828338 129.027575,452.379408 129.027575,449.802793 C129.027575,443.260008 134.603406,437.938197 140.07279,437.938197 C146.768856,437.938197 148.807583,441.773691 151.18897,444.855055 C151.380576,445.102442 151.679643,445.248081 151.995945,445.248081 C152.31326,445.248081 152.611314,445.103439 152.80292,444.855055 C155.186334,441.773691 158.427413,437.938197 163.49635,437.938197 C169.579075,437.938197 174.972425,443.260008 174.972425,449.802793 C174.972425,452.580908 173.973844,455.284209 172.173358,457.400963 L152.632603,479.559049 Z M163.506042,445.96915 C170.09375,448.001978 170.466473,453.510717 171.660584,450.229924 C172.854695,446.94913 171.079506,443.010054 167.021513,440.990291 C162.963519,438.970528 157.941859,441.124215 156.918335,443.936323 C155.894811,446.748432 156.918335,443.936323 163.506042,445.96915 Z" id="Icn-Heart"></path> </g> </g> </svg>')
    },{
      id : 5,
      title : 'tap',
      src : 'Tap',
      audio : 'audio/tap.mp3',
      svg : $sce.trustAsHtml('<svg width="45px" height="50px" viewBox="0 0 45 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 41.2 (35397) - http://www.bohemiancoding.com/sketch --> <title>Icn-Tap</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="UI-Guides" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="Iconography" transform="translate(-248.000000, -434.000000)"> <path d="M278,460.002197 L278,452 L274.662178,452 C273.783981,450.48186 272.51814,449.216019 271,448.337822 L271,447 L272,447 L272,444.998957 C272,444.44266 271.551177,444 270.997527,444 L261.002473,444 C260.455761,444 260,444.447248 260,444.998957 L260,447 L261,447 L261,448.337822 C259.48186,449.216019 258.216019,450.48186 257.337822,452 L251,452 L251,462 L257.337822,462 C259.066869,464.989007 262.298588,467 266,467 C269.701412,467 272.933131,464.989007 274.662178,462 L278,462 L278,460.002197 C278.00013,460.002201 280.883836,460.077074 282.950195,462.173462 C285.016602,464.269897 284.985352,466.989807 284.985352,466.989807 L291.012573,466.989807 C291.012573,464.011597 290.362305,461.13269 287.738037,458.413574 C285.11377,455.694458 281.872119,454.033854 278,454 C278,454.072266 278,460.002197 278,460.002197 Z M273.418483,454 C272.606718,451.994601 271.005399,450.393282 269,449.581517 L269,447 L263,447 L263,449.581517 C260.994601,450.393282 259.393282,451.994601 258.581517,454 L251,454 L251,460 L258.581517,460 C259.768292,462.93183 262.642622,465 266,465 C269.357378,465 272.231708,462.93183 273.418483,460 L278,460 L278,454 L273.418483,454 Z M268,436 L268,434.995398 C268,434.455664 267.54809,434 266.990631,434 L265.009369,434 C264.443353,434 264,434.445655 264,434.995398 L264,436 L263.990778,436 C263.450975,436 263,436.45191 263,437.009369 L263,438.990631 C263,439.556647 263.443586,440 263.990778,440 L264,440 L264,444 L268,444 L268,440 L268.009222,440 C268.549025,440 269,439.54809 269,438.990631 L269,437.009369 C269,436.443353 268.556414,436 268.009222,436 L268,436 Z M288,484 C290.761424,484 293,481.761422 293,479 C293,475.060059 288,472 288,472 C288,472 283,475.108643 283,479 C283,481.761424 285.238576,484 288,484 Z M293,467 C293,458.715729 286.265437,452.072266 278,452 C278,452.072266 278,462.002197 278,462.002197 C278,462.002197 279.83834,461.742188 281.507023,463.389771 C283.175706,465.037354 282.988633,467 282.988633,467 L293,467 Z M250.001043,451 C250.552752,451 251,451.455761 251,452.002473 L251,461.997527 C251,462.551177 250.55734,463 250.001043,463 L248,463 L248,451 L250.001043,451 Z M269,436.905521 L278.004602,436.005061 C278.554345,435.950086 279,436.348874 279,436.91489 L279,438.896152 C279,439.453611 278.557409,439.861262 278.004602,439.805981 L269,438.905521 L269,436.905521 Z M263,436.905521 L253.995398,436.005061 C253.445655,435.950086 253,436.348874 253,436.91489 L253,438.896152 C253,439.453611 253.442591,439.861262 253.995398,439.805981 L263,438.905521 L263,436.905521 Z M283,470 L283,467 L293,467 L293,470 L283,470 Z M288.5,482 C289.880712,482 291.319214,481.180152 291.319214,479.497253 C291.319214,478.1521 290.990601,477.286987 290.496338,476.771729 C290.496338,476.771729 290.412964,478.763428 289.475285,480.373535 C288.537606,481.983643 287.119288,482 288.5,482 Z M285,468.365 L285,467 L291.005005,467 L291.005005,468.365 L285,468.365 Z" id="Icn-Tap"></path> </g> </g> </svg>')
    },{
      id : 6,
      title : 'vaccuum cleaner',
      src : 'Vaccuum-Cleaner',
      audio : 'audio/vacuumCleaner.mp3',
      svg : $sce.trustAsHtml('<svg width="47px" height="50px" viewBox="0 0 47 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 41.2 (35397) - http://www.bohemiancoding.com/sketch --> <title>Icn-Vaccuum-Cleaner</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="UI-Guides" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="Iconography" transform="translate(-487.000000, -434.000000)"> <path d="M516.45007,441.020697 L516.45494,441.023178 L509.122898,455.41312 C511.306076,452.712457 514.836487,450.32602 520.105993,450.32602 C521.238876,450.32602 522.291674,450.434795 523.268182,450.632262 C525.456203,449.743288 526.407449,449.235519 527.358696,448.285525 C527.358696,448.285525 528.891304,446.244735 528.891304,444.203946 C528.891304,440.122368 526.068801,437.571381 523.06846,437.571381 C520.116441,437.571381 518.13258,438.559173 516.45007,441.020697 Z M513.70828,439.623685 L513.703917,439.621462 L493.223966,479.81563 L489.318291,480.51969 C488.04476,480.749264 487,481.990191 487,483.288629 L487,483.998572 L494.894183,483.998572 C494.409577,483.457162 494.114962,482.742547 494.114962,481.959211 C494.114962,480.27639 495.474633,478.91072 497.156695,478.898115 L506.405089,460.747121 C506.274338,461.290603 506.212101,461.763704 506.212101,462.133235 L506.212101,479.973764 C506.212101,481.637422 507.555832,482.973944 509.213409,482.973944 L510.341893,482.973944 C510.341893,482.973944 510.320786,483.999236 511.359013,483.999236 C512.39724,483.999236 512.39724,482.973944 512.39724,482.973944 L527.850038,482.973944 C527.850038,482.973944 527.767874,483.987404 528.853213,483.999236 C529.938553,484.011067 529.915939,482.973944 529.915939,482.973944 L530.999639,482.973944 C532.662648,482.973944 533.998294,481.629667 533.996332,479.971417 C533.996332,479.971417 533.975879,465.098849 533.999884,462.133235 C534.016907,460.030267 532.159246,454.972577 527.435085,452.208124 C528.863382,451.316276 528.898687,451.17049 529.913043,450.326314 C529.913043,450.326314 532.56954,447.775327 532.56954,444.203946 C532.56954,439.714185 529.069142,434 523.06846,434 C516.58946,434 514.05073,438.894129 513.70828,439.623685 Z M520.015684,453.387046 C511.761971,453.438925 508.785055,460.596857 508.785055,462.871115 L508.785055,473.782368 L514.560689,473.784328 L514.815983,473.51103 C515.189045,473.11166 515.938783,472.784171 516.486265,472.784171 L523.766666,472.784171 C524.311197,472.784171 525.082828,473.091957 525.483559,473.471631 L525.819403,473.789827 L531.420808,473.791715 C531.420808,473.791715 531.407392,465.253297 531.426952,462.871115 C531.443354,460.873475 529.323588,455.556695 523.731169,453.892235 C523.149522,454.145527 522.76454,454.65016 522.25,456.448682 C521.947279,457.506811 521.828233,458.448352 521.783465,459.104505 C522.331791,459.572263 522.679004,460.265245 522.679004,461.03862 C522.679004,462.447288 521.527054,463.589239 520.106051,463.589239 C518.685047,463.589239 517.533097,462.447288 517.533097,461.03862 C517.533097,460.227172 517.915338,459.504227 518.511062,459.037077 C518.648427,458.143102 518.880093,456.851351 519.184783,455.938484 C519.439188,455.176273 519.566907,454.282085 520.015684,453.387046 Z M513.416371,475.832211 L526.79573,475.832211 L526.306697,477.920526 C526.048981,479.02105 524.920971,479.913201 523.789809,479.913201 L516.422292,479.913201 C515.289969,479.913201 514.164674,479.027687 513.905404,477.920526 L513.416371,475.832211 Z M497.18018,484 C498.308762,484 499.223658,483.086308 499.223658,481.959211 C499.223658,480.832114 498.308762,479.918422 497.18018,479.918422 C496.051598,479.918422 495.136701,480.832114 495.136701,481.959211 C495.136701,483.086308 496.051598,484 497.18018,484 Z" id="Icn-Vaccuum-Cleaner"></path> </g> </g> </svg>')
    },{
      id : 7,
      title : 'washing machine',
      src : 'Washing-Machine',
      audio : 'audio/washingMachine.mp3',
      svg : $sce.trustAsHtml('<svg width="46px" height="50px" viewBox="0 0 46 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 41.2 (35397) - http://www.bohemiancoding.com/sketch --> <title>Icn-Washing-Machine</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="UI-Guides" stroke="none" stroke-width="1" fill-rule="evenodd"> <g id="Iconography" transform="translate(-727.000000, -434.000000)"> <path d="M727,436.996532 C727,435.341593 728.351781,434 730.000444,434 L769.999556,434 C771.656655,434 773,435.337379 773,436.996532 L773,481.003468 C773,482.658407 771.648219,484 769.999556,484 L730.000444,484 C728.343345,484 727,482.662621 727,481.003468 L727,436.996532 Z M729,437.997392 C729,436.894263 729.89666,436 730.997492,436 L769.002508,436 C770.105692,436 771,436.895858 771,437.997392 L771,445 L729,445 L729,437.997392 Z M729,447 L771,447 L771,479.00008 C771,480.104605 770.10334,481 769.002508,481 L730.997492,481 C729.894308,481 729,480.108059 729,479.00008 L729,447 Z M732,439 L740,439 L740,442 L732,442 L732,439 Z M766.5,442 C767.328427,442 768,441.328427 768,440.5 C768,439.671573 767.328427,439 766.5,439 C765.671573,439 765,439.671573 765,440.5 C765,441.328427 765.671573,442 766.5,442 Z M761.5,442 C762.328427,442 763,441.328427 763,440.5 C763,439.671573 762.328427,439 761.5,439 C760.671573,439 760,439.671573 760,440.5 C760,441.328427 760.671573,442 761.5,442 Z M750,474 C756.075132,474 761,469.075132 761,463 C761,456.924868 756.075132,452 750,452 C743.924868,452 739,456.924868 739,463 C739,469.075132 743.924868,474 750,474 Z M750,471.903456 C754.970563,471.903456 759,467.874018 759,462.903456 C759,460.725814 758.130737,462.899414 754.009766,462.903456 C749.888794,462.907497 749.500928,459.973022 745.995728,459.973022 C743.057739,459.973022 741,461.819336 741,462.903456 C741,467.873973 745.029437,471.903456 750,471.903456 Z" id="Icn-Washing-Machine"></path> </g> </g> </svg>')
    }];
    


    $scope.player = {
      key: '' // Holds a last active track
    }
    


    $ionicPlatform.ready(function() {
      $scope.playTrack = function(track, key) {
        // Preload an audio track before we play it
        window.plugins.NativeAudio.preloadComplex(key, track, 1, 1, 0, function(msg) {
          // If this is not a first playback stop and unload previous audio track
          if ($scope.player.key.length > 0) {
            window.plugins.NativeAudio.stop($scope.player.key); // Stop audio track
            window.plugins.NativeAudio.unload($scope.player.key); // Unload audio track
          }
  
          window.plugins.NativeAudio.loop(key); // Play audio track
          $scope.player.key = key; // Set a current audio track so we can close it if needed 
        }, function(msg) {
          console.log('error: ' + msg); // Loading error
        });
        
      };
  


      $scope.stopTrack = function() {
          // If this is not a first playback stop and unload previous audio track
          //if ($scope.player.key.length > 0) {
            window.plugins.NativeAudio.stop($scope.player.key); // Stop audio track
            window.plugins.NativeAudio.unload($scope.player.key); // Unload audio track
            $scope.player.key = ''; // Remove a current track on unload, it will break an app if we try to unload it again in playTrack function
         // }
      };
    });


    console.log($scope.timeLeft);


    $scope.startTime = function() {
      $scope.disabled = true;
      
      time = $interval(function() {
        $scope.timeLeft--;
        if($scope.timeLeft <= 0) {
          $scope.disabled = true;
          $interval.cancel(time);
          $scope.resetTime();
          $scope.stopTrack();
          $state.go('home');
          $scope.trackPlaying = false;
        }
      }, 1000);
    }


    
    $scope.stopTime = function() {
      $scope.disabled = false;
      $scope.stopTrack();
      $interval.cancel(time);
    }


    
    $scope.resetTime = function() {
      $scope.disabled = false;
      $scope.stopTrack();
      $scope.timeLeft = 0;
    }

    $ionicModal.fromTemplateUrl('templates/emailPopup.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });
    

    $scope.sendFeedback= function() {
        $scope.modal.show()
    }
    var mailgunUrl = "sandbox207c9f123797453495410039734ce565.mailgun.org";
    var mailgunApiKey = window.btoa("api:key-731bb4e632410f176743c81a53383e32")
    $scope.email = {
      from : '',
      subject : '',
      message : ''
    }
    $scope.sendMail = function() {
        $http(
            {
                "method": "POST",
                "url": "https://api.mailgun.net/v3/" + mailgunUrl + "/messages",
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + mailgunApiKey
                },
                data: "to=" + "catchus@thepinkbarracuda.com" + "&from=" + $scope.email.from + "&subject=" + $scope.email.subject + "&text=" + $scope.email.message
            }
        ).then(function(success) {
            alert("SUCCESS " + JSON.stringify(success));
            $scope.modal.hide();
        }, function(error) {
            alert("ERROR " + JSON.stringify(error));
        });
    }
})


app.controller('HomeCtrl', function($scope) {
})



app.filter('timecode', function() {
  return function(seconds) {
    seconds = Number.parseFloat(seconds);

    var wholeSeconds = Math.floor(seconds);
    var minutes = Math.floor(wholeSeconds / 60);
    if(minutes < 10) {
      minutes = '0' + minutes;
    }
    remainingSeconds = wholeSeconds % 60;

    output = minutes + ':';

    if(remainingSeconds < 10) {
      output += '0';
    }

    output += remainingSeconds;

    return output;
  }
});