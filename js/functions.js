function filterLoadLga(combo, depth){
    //$('.loadingdiv').removeClass('hidden');
    var loadingDiv = $(combo).closest('div.geobox').find('div.loadingdiv');
    $(loadingDiv).removeClass('hidden');
    
    var url = '';
    if(depth == '' || depth==0)
        //url = '../ajax/filterLoadLga'; //this should be url = '../ajax/filterLoadLga';
            url = './ajax/filterLoadLga';
    else
        url = '../ajax/filterLoadLga';
    
    var index = combo.selectedIndex;
    var select = document.getElementById($(combo).closest('div.geobox').find('select.lgaDropdown').attr('id'));
    var facSelect = document.getElementById($(combo).closest('div.geobox').find('select.facilityDropdown').attr('id'));
    
    $.ajax({
        type: 'POST',
        url: url,
        data: {stateid:index},
        dataType: 'json',
        success: function(lgas){
            //log('lgas: ' + lgas.length + ' type: ' + JSON.stringify(lgas));
            if(select==null || select.options==null)
                return;
            else
                select.options.length = 0;
            
            for(key in lgas){
                if(isNaN(key)) return;
                var option = document.createElement("option");
                option.text = lgas[key];
                option.value = key;
                select.add(option);
            }
            
            //set the facility to just one (first) element to avoid inconsistency
            //var facSelect = document.getElementById('facilityDropdown');
            if(facSelect != null) facSelect.options.length = 1;
            $(loadingDiv).addClass('hidden');
        },
        error: function(){log('An error occurred.')},
        complete:function(){}
    });
}


function filterLoadFacility(combo, depth){
    var loadingDiv = $(combo).closest('div.geobox').find('div.loadingdiv');
    $(loadingDiv).removeClass('hidden');
    
    var url = '';
    if(depth == '' || depth == 0)
        url = './ajax/filterLoadFacility'; //this should be url = './ajax/filterLoadFacility';
    else if(depth==1)
        url = '../ajax/filterLoadFacility';
    
    var index = $('#' + combo.id).val(); 
    var select = document.getElementById($(combo).closest('div.geobox').find('select.facilityDropdown').attr('id'));
    //var select = document.getElementById(facilitySelectId);
    
    log('index ' + index +' select ' + select);
    
    $.ajax({
        type: 'POST',
        url: url,
        data: {lgaid:index},
        dataType: 'json',
        success: function(facs){
            //console.log('facs: ' + JSON.stringify(facs));
            if(select==null || select.options==null)
                return;
            else
                select.options.length = 0;
            
            for(key in facs){                
                if(isNaN(key)) return;
                var option = document.createElement("option");
                option.text = facs[key];
                option.value = key;
                select.add(option);
            }
            
            $(loadingDiv).addClass('hidden');
        },
        error: function(){},
        complete:function(){}
    });
}


function validateDates(fromdate, todate){
    //alert('dates');
     if((fromdate == '' && todate != '') || (fromdate != '' && todate == '')){
            $('#dialog p').text('Please select start and end dates');
            $('#dialog').dialog({modal:true});
            return;
     }
     else{
         //get the right date formats
         var today = new Date();
         var fromArray = fromdate.split('-');
         var toArray = todate.split('-');
         //DATE FROMAT YEAR, MONTH, DATE...-1 ON MONTH BECAUSE MONTHS START FROM 0 IN JS DATE OBJECT
         var fromDateObject = new Date(fromArray[2], fromArray[1]-1, fromArray[0]);
         var toDateObject = new Date(toArray[2], toArray[1]-1, toArray[0]);

         //future dates
         if(fromDateObject > today || toDateObject > today){
            $('#dialog p').text('Please select dates not later than today');
            $('#dialog').dialog({modal:true});;
            return;
         }
         if(toDateObject < fromDateObject){
            $('#dialog p').text('Start date cannot be later than end date');
            $('#dialog').dialog({modal:true});;
            return;
         }
     }
     
     return true;
}


function createExcelFile(url, format ){
    var url = './' + url;    
    
    $('#dialog p').text('Your report is being generated. Please wait!');
    $('#dialog').dialog({modal:true});
    
    state = $('#stateDropdown').val();
    lga = $('#lgaDropdown').val();
    facility = $('#facilityDropdown').val();
    cadre = $('#cadreDropdown').val();
    
    log('createExcelFile - url: ' + url);
                     
    $.ajax({
        type: 'POST',
        url: url,
        dataType:'json',
        data: {state:state,lga:lga,facility:facility,cadre:cadre, format: format},
        success: function(resultObj){
            log('excelFileUrl: ' + JSON.stringify(resultObj)); 
            //return;
            if(resultObj.STATUS == 'ERROR'){
                $('#dialog p').text('An error occurred while generating report. Please try again.');
                //USE THIS IN DEBUG MODE
                //$('#dialog p').text(resultObj['MESSAGE']);
            }
            else{
                $('#dialog p').text('Report successfully generated. Download will now begin');
                
                setTimeout(function(){
                    $('#dialog').dialog("close");
                    $('#dframe').attr('src',resultObj.URL);
                },2000);
            }
        },
        error: function(){},
        complete:function(){}
    });
}


function createDatedExcelFile(url, format ){ 
    var url = './' + url;
    
    $('#dialog p').text('Your report is being generated. Please wait!');
    $('#dialog').dialog({modal:true});
    
    channel = $('#channelDropdown').val();
    state = $('#stateDropdown').val();
    lga = $('#lgaDropdown').val();
    facility = $('#facilityDropdown').val();
    cadre = $('#cadreDropdown').val();
    fromdate = $('#from').val();
    todate = $('#to').val();
                     
    $.ajax({
        type: 'POST',
        url: url,
        dataType:'json',
        data: {channel:channel, state:state,lga:lga,facility:facility,cadre:cadre, format: format, fromdate: fromdate, todate: todate},
        success: function(resultObj){
            //console.log('excelFileUrl: ' + resultObj);
            //console.log('excelFileUrl: ' + resultObj.STATUS);
            if(resultObj.STATUS == 'ERROR'){
                $('#dialog p').text('An error occurred while generating report. Please try again.');
                //USE THIS IN DEBUG MODE
                //$('#dialog p').text(resultObj.MESSAGE);
            }
            else{
                $('#dialog p').text('Report successfully generated. Download will now begin');
                
                setTimeout(function(){
                    $('#dialog').dialog("close");
                    $('#dframe').attr('src',resultObj.URL);
                },2000);
            }
        },
        error: function(){},
        complete:function(){}
    });
}

function downlaodFile(url, filename){ 
    //To get the path router to choose the Util controller, 
    //step up directory structure one level to pick it
    //in same folder of current controller or adjust to suit. 
    var path = '../util/downloadFile?' +  
                'filepath=' + url +
                '&filename=' + filename;
    $('#dframe').attr('src', path);
}

function createCompareReport(url, format){ 
    var url = './' + url;
    
    var selectionString  = $('#selectionjson').val();
    
    if(selectionString != ''){
        $('#dialog p').text('Your report is being generated. Please wait!');
        $('#dialog').dialog({modal:true});
    }
    else{
        $('#dialog p').text('Please add selection(s) to compare list!');
        $('#dialog').dialog({modal:true});
        return;
    }
    
    
    
    $.ajax({
        type: 'POST',
        url: url,
        dataType:'json',
        data: {selectionString:selectionString, format: format},
        success: function(resultObj){                 
            console.log('my pdf url: ' + JSON.stringify(resultObj));
            if(resultObj.STATUS == 'ERROR'){
                $('#dialog p').text('An error occurred while generating report. Please try again.');
                //USE THIS IN DEBUG MODE
                //$('#dialog p').text(resultObj.MESSAGE);
            }
            else{
                $('#dialog p').text('Report successfully generated. Download will now begin');
                //console.log('URL: ' + JSON.stringify(resultObj));
                setTimeout(function(){
                    $('#dialog').dialog("close");
                    //$('#dframe').attr('src', resultObj.URL);
                    downlaodFile(resultObj.URL, resultObj.FILENAME);
                },2000);
            }
        },
        error: function(xHr, status, error){
            console.log('error function: ' + JSON.stringify(xHr.responseText));
        },
        complete:function(){}
    });
}



 function checkAccess(operation, permissions){
    //log('permissions 2: ' + $('#container-row').data("permissions"));
    //log('operation: ' + operation);   

    for(key in permissions)
        if(permissions[key] == operation)
            return true;

    return null;
}


function loadStackedBarChart(){
    //log('loadStackedBarChart');
    //$('#dialog p').text('Loading...Please wait!');
    //$('#transparentdialog').dialog({modal:true});
    $('.loadingdiv').removeClass('hidden');
    
    url = './site/filterStackedChart';
    
    state = $('#stateDropdown').val();
    lga = $('#lgaDropdown').val();
    facility = $('#facilityDropdown').val();
    cadre = $('input[name="cadreOption"]:checked').val();
    fromdate = $('#from').val();
    todate = $('#to').val()
    
    //log('state: ' + state + ' lga: ' + lga + ' facility ' + facility + ' cadre ' + cadre);
    //return;
    
    //validate dates
    if(!validateDates(fromdate, todate)) {
        $('.loadingdiv').addClass('hidden');
        return;
    }
    
    $.ajax({
        type: 'POST',
        url: url,
        data: {state:state, lga:lga, facility:facility, cadre:cadre, fromdate:fromdate, todate:todate},
        dataType: 'json',
        success: function(performanceItems){
            //log(JSON.stringify(performanceItems));
            //reloadChart(performanceItems);
            log('performanceItems: ' + performanceItems);
            
            drawChart(performanceItems);
            
            $('.loadingdiv').addClass('hidden');
        },
        error: function(e){
            log('An error occured loading chart data: ' + JSON.stringify(e));
        },
        complete:function(){
            
        }
    });
}



$(document).ready(function(){
    var labelSelectedMode = '';
    $('label.btn.btn-default').click(function(){
//        if($(this).has('.modeButton') && (!$(this).hasClass('currentMode'))){
//            log('no cuurent mode');
//            $('#filterButton').click();
//            $(this).siblings().removeClass('currentMode');
//            $(this).addClass('currentMode');
//        }
        labelSelectedMode = $(this).attr('id')
        
        log('label id: ' + $(this).attr('id') + ' labelSelectMode: ' + labelSelectedMode);
        if($(this).attr('id') == 'ja'){
            $(this).closest('div.optionbox').siblings('div.geobox').find('input.datepicker').prop('disabled','disabled');
            $(this).closest('div.optionbox').siblings('div.geobox').find('a.homeFilterButton').click();
        }
        else{
            $(this).closest('div.optionbox').siblings('div.geobox').find('input.datepicker').removeProp('disabled');
            $(this).closest('div.optionbox').siblings('div.geobox').find('a.homeFilterButton').click();
        }
    });
    
    
    /*
     * Click event handler for all filterButtons on homepage
     */
    $('a.homeFilterButton').click(function(){
       log("this ID: " + $(this).attr('id'));
       var mode ='';
       if(labelSelectedMode != '')
           mode = labelSelectedMode;
       else
            mode = $(this).closest('div.geobox').siblings('div.optionbox').find('input[type="radio"]:checked').val();
        
       //clear the labelSelectedMode immediately to keep sterile
       labelSelectedMode = '';
       
       log("mode inside click: " + mode);
       
       var chartCanvas = $(this).closest('div.geobox').siblings('.whiteframe').find('div.chartcanvas');
       
       //hide the loading div
       var loadingDiv = $(this).closest('div.geobox').find('div.loadingdiv');
       $(loadingDiv).removeClass('hidden');
       
       var url = '';
       if(mode == 'training' || mode == 'ja') url = './filterTJA';
       if(mode == 'pretest' || mode == 'posttest') url = './filterTests';
       
        state = $(this).closest('div.geobox').find('.stateDropdown').val();
        lga = $(this).closest('div.geobox').find('.lgaDropdown').val();
        facility = $(this).closest('div.geobox').find('.facilityDropdown').val();
        fromdate = $(this).closest('div.geobox').find('.fromdate').val();
        todate = $(this).closest('div.geobox').find('.todate').val();
                
        //log('state: '+ state); 
        //log('lga: '+ lga); 
        //log('fac: '+ facility); 
        
        //validate dates
        if(!validateDates(fromdate, todate)){
            $(loadingDiv).removeClass('hidden');
            return;
        }
        
        $.ajax({
            type: 'POST',
            url: url,
            data: {state:state, lga:lga, facility:facility, fromdate:fromdate, todate:todate, mode:mode},
            dataType: 'json',
            success: function(performanceData){
                //log(JSON.stringify(performanceData));
                //log(performanceData[0].length);
                if(performanceData[0].length <= 0){
                    $(chartCanvas).html('No usage data for selected location');
                }
                else{
                    //log('performanceItems: ' + JSON.stringify(performanceData));
                    
                    if(mode == 'training' || mode == 'ja') {
                        log('inside trainig');
                        tjaPerformance = performanceData;
                        drawTJAChart();
                    }
                    else if(mode == 'pretest' || mode == 'posttest') {
                        log('inside test');
                        testPerformance = performanceData;
                        drawTestChart();
                    }
                }

                $(loadingDiv).addClass('hidden');
            },
            error: function(e){
                log('An error occured loading chart data: ' + JSON.stringify(e));
                $(loadingDiv).addClass('hidden');
            },
            complete:function(){}
        });
       
    });
});



/*
 * Help to reload the google chart
 */
function reloadGoogleChart(performanceItems){
    var data = "['Year', 'Fantasy & Sci Fi', 'Romance', 'Mystery/Crime', 'General','Western', 'Literature', {type: 'string', role: 'tooltip'} ], " +
               "['Two thousand and ten', 10, 24, 20, 32, 18, 5, 'tttttt']," +
               "['Two thousand and twenty', 16, 22, 23, 30, 16, 9, 'wwwwww'],"  +
               "['Two thousand and thirty', 28, 19, 29, 30, 12, 13, 'hhhhh']";
     
      return data;      
}


function reloadChart(performanceItems){
       //log('reloadChart');
       var chart1 = new cfx.Chart();

       chart1.setGallery(cfx.Gallery.Bar); 
       chart1.getAllSeries().setStacked(cfx.Stacked.Normal);

/////////////////////////////////////////////////////////
//        performanceItems = [{
//                "Health Worker Performance" : "Bar 1", 
//                "High Performing" : 20,
//                "Average" : 10,
//                "Under Performing" : 20,
//                "Failing" : 10,
//                "No Data" : 40
//        },
//        {
//                "Health Worker Performance" : "Bar 2", 
//                "High Performing" : 40,
//                "Average" : 10,
//                "Under Performing" : 20,
//                "Failing" : 10,
//                "No Data" : 20
//        }
//    ];
    //XX% High Performing: Percent HCWs with median test score >80% 
/////////////////////////////////////////////////////////

    var items = performanceItems;
    //log('items: ' + JSON.stringify(items));
    chart1.setDataSource(items); 

    chart1.getAxisY().getLabelsFormat().setFormat(cfx.AxisFormat.Percentage);

    $('#div_obj-1').html('');

    chart1.create('div_obj-1');
}

/*
 * UTILITY FUNCTIONS
 */
function log(msg){
    console.log(msg);
}

function removeElementById(id,callback){
    //$('#'+id).remove();
    if(callback==''){
        $('#'+id).fadeOut();
        //$('#'+id).remove();
    }
    else {
        $('#'+id).fadeOut(callback);
        //$('#'+id).remove();
    }
}

function removeElementByClass(classname, callback){
    //$('.'+classname).remove();
    $('.'+classname).fadeOut();
}

function checkPasswordMatch(passwordFieldID, confirmFieldID){
    passwordFieldValue = $('#'+passwordFieldID).val();
    confirmFieldValue = $('#'+confirmFieldID).val();
    
    if(passwordFieldValue == '' && confirmFieldValue == '') 
        return true;
    
    if(passwordFieldValue!='' || confirmFieldValue != '') {
        if(passwordFieldValue == confirmFieldValue ){
            return true;
        }
        else {
            alert('Password mismatch');
        }
    }
    
    return false;
}