/*
* Internet Broadway Database shell for Android
*
* Titanium SDK 2.0 
* 
* Authors: jennings,liddel
* Copyright 2012. Persuasive Media Inc.
*/

/*
 * Global declarations
 */

var staleFocus=0;
var webView;

/*
* Setup up tab data
*/
var baseURL = "http://ibdb.com/mobile/"; 

var data = [
	{url:baseURL+'test_only.php?app=1'},
	{url:baseURL+'index.php?app=1'},
	{url:baseURL+'search_adv_show.php?app=1'},
	{url:baseURL+'search_adv_people.php?app=1'},
	{url:baseURL+'search_adv_venue.php?app=1'},
	{url:baseURL+'search_adv_awards.php?app=1'},
	{url:baseURL+'about_app.php?app=1'}	
];

/*
* Check for network
*/


/*
* Setup loading indicator.
*/
function getLoaderIndicator(){
	return Ti.UI.createActivityIndicator({
		message:'Initializing....',
	    height:50,
	    width:50
	});
}
var activityIndicator = getLoaderIndicator();

/*
* Add global app listeners for externally clicked links in the web view
*/
Ti.App.addEventListener('linkClicked', function(evt) {
    //Titanium.API.info('EXTERNAL LINK: ' + evt.href);
    Titanium.Platform.openURL(evt.href);
    
});


/*
* Dispose of the previous webView and create a new instance to use across all tabs.
*/
function createClearWebView() {
	
	webView=null;
	
	webView = Titanium.UI.createWebView({backgroundColor:'#666666',top:41});
	webView.setEnableZoomControls(false);
	webView.hide();
	
	webView.addEventListener('beforeload',function(e){
	   activityIndicator.show();
	   Titanium.API.info('BEFORELOAD:'+e.url);
	   
	    //check for external links
	   	chkLink = e.url.indexOf("ibdb.com/mobile/");  
   		if (chkLink == -1) {
   			webView.stopLoading();
   			Titanium.App.fireEvent('linkClicked', { href: e.url });		            		
    	}
    	
	   /*below is an example of checking a url before it loads and loading its tab 
	    * instead. (ILNYT)
	    */
	   /*
	   if (e.url==baseURL+"guide") {
	   		webView.stopLoading();
	   		tabGroup.setActiveTab(2);
	   }
	   */
	
	});
	webView.addEventListener('load',function(){	
		
		webView.show();		
		activityIndicator.hide();
		//  indicates we are still on the same focus tab
		// so a click event on the tab should reset the tab
		staleFocus = 1; 
	});
	//webView.addEventListener('open', function() {
	    // and 3 times a second, check to see if any links have been clicked
	//    var x = setInterval(function(){pollClickedLinks(webView);}, 333);
	//});

	
    webView.addEventListener('error', function(){
        Titanium.API.info('WEBVIEW  ERR: '+err);
    });

}

 
/*
* Create tabs instances to be added to the tab group and assign URLs 
*/
 
function createTab(icon,label,tid) {
    var win = Titanium.UI.createWindow({  
        title: label,
        backgroundColor: '#666666',
        orientationModes: 'Portrait'
        
     });
    win.orientationModes = [Ti.UI.PORTRAIT];
 
    
    win.addEventListener('android:back', function() { 
    	Ti.API.info("BACK KEY CLICKED");
    	try {
	    	var dogo = webView.evalJS("IsPhotoswipeVisible();");  //then hide it android 2.3.4 and under	
	    	//Ti.API.info("dogo:" + dogo);  
	    	if (dogo!=='IPVReturnPSIhide') 	 {
	    			webView.goBack();
	    			//webView.evalJS("history.back();");
	    	}
    	}
    	catch (err) {
    		alert(err.message());
   	    	webView.goBack();
   	    	//webView.evalJS("history.back();");
    	}
	}); 
	
	
	var view = Titanium.UI.createView({backgroundColor:'black', top:0,left:0,width:win.width, height:40 });
	win.add(view);
	
	var headLabel = Titanium.UI.createLabel({ 
		text:'Internet Broadway Database', height:'auto', width:'auto', 
		color:'white', font:{fontSize:18}, textAlign:'center' 
	});
	view.add(headLabel);
	
	
	
	
    var tab = Titanium.UI.createTab({
        icon: icon+'.png',
        title: label ,
        id:tid,
        window: win
    });
    //
 	// Use the tab  click event to reset a current web page back to its original state
 	//
	 tab.addEventListener('click', function(e) {
		
		Titanium.API.info('TAB clicked: '+tab.id);		
		Titanium.API.info('TAB staleFocus: '+staleFocus);
			
		//state to indicate whether the tab just focused. Only reset
		// when tab is focused and the initial page is no longer on the first page
		// aka stale.
		if (staleFocus==1) {
			webView.url=data[this.id].url;		
		}
 

	});

 	
    return tab;
}
 

 
/*
* Create tab group (main window) and setup focus events to handle initial tab click
*
*/
var tabGroup = Titanium.UI.createTabGroup({
    id:'tabGrp'
});
 
 
// Add focus event listeners for the tab now
tabGroup.addEventListener('focus', function(e) {
    if (e.previousTab.window) {
    	webView.hide();
        e.previousTab.window.remove(webView);
        // recreating the webview to clear cache/history/screen
        //Titanium.API.info("Recreating web view");
        
		createClearWebView();
		staleFocus = 0;
    }
    if (e.tab) {
    	Titanium.API.info('Tab Focus: ' + e.tab.title);
		//webView.url="blank.html";
		webView.url=data[e.tab.id].url;		
        e.tab.window.add(webView);
    }
});



/*
* Final render - 
* Create the initial web view, add all tabs to the tab group and open the group
* (A tab group is considered a heavyweight window).
*/
Titanium.UI.setBackgroundColor('#666666');

createClearWebView();

tabGroup.addTab( createTab('star', 'Home',1) );
tabGroup.addTab( createTab('show', 'Shows',2) );
tabGroup.addTab( createTab('people', 'People',3) );
tabGroup.addTab( createTab('theater', 'Theatres',4) );
tabGroup.addTab( createTab('trophy', 'Awards',5) );
tabGroup.addTab( createTab('about', 'About',6) );
 
// Open the tab group
tabGroup.open();


