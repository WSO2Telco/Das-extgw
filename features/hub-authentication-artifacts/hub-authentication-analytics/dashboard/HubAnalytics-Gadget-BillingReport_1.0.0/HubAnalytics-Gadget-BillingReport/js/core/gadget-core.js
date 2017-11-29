
/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
$(function () {
    var gadgetLocation;
    var conf;
    var schema;
    var pref = new gadgets.Prefs();

    var providerData;

    var serviceProviderId = 0;
    var loggedInUser;

    var init = function () {
        $.ajax({
            url: gadgetLocation + '/conf.json',
            method: METHOD.GET,
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                conf = JSON.parse(data);
                conf.serviceProvider = serviceProviderId;

                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getSchema',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        schema = data;
                    }
                });
            }
        });
    };

    var getLoggedInUser = function () {
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getLoggedInUser',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                loggedInUser = data.LoggedInUser;

                // hide the operator / serviceProvider drop-down according to logged in user
                hideDropDown(loggedInUser);

                if (!(loggedInUser.isAdmin) && (loggedInUser.isOperatorAdmin || loggedInUser.isCustomerCareUser)) {
                    $("#yearContainer").removeClass("col-top-pad");
                    $("#monthContainer").removeClass("col-top-pad");
            
                    //conf.operatorName = operatorName;
                } else if (!(loggedInUser.isAdmin) && loggedInUser.isServiceProvider) {
                    $("#yearContainer").removeClass("col-top-pad");
                    $("#monthContainer").removeClass("col-top-pad");
                }

                if(!(loggedInUser.isAdmin)) {
                    $("#directiondd").hide();
                    $("#repriceContainer").hide();
                }
            },
            complete : function (xhr, textStatus) {
                if (xhr.status == "403") {
                    window.top.location.reload(false);
                }
            }
        });
    };

    var getProviderData = function (){

        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                providerData = data;
            }
        });

        return providerData;
    };

    var initiateReprice = function (){
        console.log('Inintiating repricing');
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=initiateReprice',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                providerData = data;
            }
        });

        return providerData;
    };

    function getFilterdResult() {
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            init();
            getProviderData();
        });
    };

    $("#button-search").click(function() {
        getGadgetLocation(function (gadget_Location) {
            getLoggedInUser();
            gadgetLocation = gadget_Location;
            init();
            getProviderData();
        });
    });

    function setConfDara() {
		conf.spf= $("#button-sp").text().trim();
    };

    $("#button-initiate-reprice").click(function () {
        initiateReprice();
    });

    $("#button-generate-bill-csv").click(function () {
        getLoggedInUser();
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            $("#output").html("");
            setConfDara();
            conf.serviceProvider = serviceProviderId;

            var year = $("#button-year").val();
            var month = $("#button-month").val();

            if(year === "") {
                $("#popupcontent p").html('Please select year');
                $('#notifyModal').modal('show');
            }
            else if(month === "") {
                $("#popupcontent p").html('Please select month');
                $('#notifyModal').modal('show');
            }

            $("#list-summery-report").removeClass("hidden");
            conf.year = year;
            conf.month = month;

            var btn = $("#button-generate-bill-csv");
            btn.prop('disabled', true);
            setTimeout(function () {
            btn.prop('disabled', false);
            }, 2000);
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=generateCSV',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {

                    $("#list-available-report").show();
                    $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                    + "Please refresh the billing report"
                    + '</div>' + $("#output").html());
                    $('#success-message').fadeIn().delay(2000).fadeOut();
                }
           });
        });
    });

    $("#button-generate-error-csv").click(function () {
        getLoggedInUser();
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            $("#output").html("");

            conf.serviceProvider = serviceProviderId;
            setConfDara();
            var year = $("#button-year").val();
            var month = $("#button-month").val();

            if(year === "") {
                $("#popupcontent p").html('Please select year');
                $('#notifyModal').modal('show');
            }
            else if(month === "") {
                $("#popupcontent p").html('Please select month');
                $('#notifyModal').modal('show');
            }

            $("#list-error-report").removeClass("hidden");
            conf.year = year;
            conf.month = month;

            var btn = $("#button-generate-bill-csv");
            btn.prop('disabled', true);
            setTimeout(function () {
            btn.prop('disabled', false);
            }, 2000);

            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=generateErrorCSV',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {
                    $("#list-error-report").show();
                    $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                    + "Please refresh the billing error report"
                    + '</div>' + $("#output").html());
                    $('#success-message').fadeIn().delay(2000).fadeOut();
                }
            });
        });
    });

    $("#button-generate-bill-pdf").click(function () {
        getLoggedInUser();
        $("#output").html("");
        getGadgetLocation(function (gadget_Location) {
            var serviceProviderName = $("#button-sp").val();

            gadgetLocation = gadget_Location;
            setConfDara();
            conf.serviceProvider = serviceProviderId;
            var year = $("#button-year").val();
            var month = $("#button-month").val();

            if(year === "") {
                $("#popupcontent p").html('Please select year');
                $('#notifyModal').modal('show');
            } else if(month === "") {
                $("#popupcontent p").html('Please select month');
                $('#notifyModal').modal('show');
            }

            conf.year = year;
            conf.month = month;
            $("#list-the-bill").removeClass("hidden");


            var btn = $("#button-generate-bill-pdf");
            btn.prop('disabled', true);
            setTimeout(function () {
            btn.prop('disabled', false);
            }, 2000);

            setTimeout(function () {
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=generateBill',
                    method: "POST",
                    data: JSON.stringify(conf),
                    contentType: "application/json",
                    async: true,
                    success: function (data) {
                        $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                        + "Please refresh the billing report"
                        + '</div>' + $("#output").html());
                        $('#success-message').fadeIn().delay(2000).fadeOut();
                    }
                });
            }, 100);
        });
    });


    $("#list-summery-report").click(function () {
        getLoggedInUser();
        $("#output").html("");
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=availableCSV',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
					
					if( data[0].name=="0"){
						
						$("#output").html("No generated files")
					}else{
						$("#output").html("<ul class = 'list-group'>")
						for (var i = 0; i < data.length; i++) {
							$("#output").html($("#output").html() + "<li class = 'list-group-item'>" +
								" <span class='btn-label'>" + data[i].name + "</span>" +
								" <div class='btn-toolbar'>" +
								"<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ", \"csv\")'>Download</a>" +
								"<a class='btn btn-primary btn-xs' onclick='removeFile(" + data[i].index + ", \"csv\")'>Remove</a>" +
								"</div>" +
								"</li>");
						}
						$("#output").html($("#output").html() + "<ul/>")
					}

                }
            });

        });
    });

    $("#list-error-report").click(function () {
        getLoggedInUser();
        $("#output").html("");
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=availableErrorCSV',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
					if( data[0].name=="0"){
						
						$("#output").html("No generated files")
					}else{
						$("#output").html("<ul class = 'list-group'>")
						for (var i = 0; i < data.length; i++) {
							$("#output").html($("#output").html() + "<li class = 'list-group-item'>" +
								" <span class='btn-label'>" + data[i].name + "</span>" +
								" <div class='btn-toolbar'>" +
								"<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ", \"csv-error\")'>Download</a>" +
								"<a class='btn btn-primary btn-xs' onclick='removeFile(" + data[i].index + ", \"csv-error\")'>Remove</a>" +
								"</div>" +
								"</li>");
						}
						$("#output").html($("#output").html() + "<ul/>")
					}
                }
            });

        });
    });

    $("#list-the-bill").click(function () {
        getLoggedInUser();
        $("#output").html("");

        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=availablePDF',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
					if( data[0].name=="0"){
						
						$("#output").html("No generated files")
					}else{
						$("#output").html("<ul class = 'list-group'>")
						for (var i = 0; i < data.length; i++) {
							var pdf = "pdf";
							$("#output").html($("#output").html() + "<li class = 'list-group-item'>" +
								" <span class='btn-label'>" + data[i].name + "</span>" +
								" <div class='btn-toolbar'>" +
								"<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ",  \"pdf\")'>Download</a>" +
								"<a class='btn btn-primary btn-xs' onclick='removeFile(" + data[i].index + ", \"pdf\")'>Remove</a>" +
								"</div>" +
								"</li>");
						}
						$("#output").html($("#output").html() + "<ul/>")
					}
                }
            });

        });
    });

    var createYearSelectBox = function () {
        var date = new Date();
        var fixYear = date.getFullYear();
        var currentMonth = date.getMonth();
        var currentYear = fixYear;
        var allMonths = false;

        $("#button-year").text(currentYear);
        $("#button-year").append('&nbsp;<span class="caret"></span>');
        $("#button-month").text(moment(currentMonth+1, 'MM').format('MMMM'));
        $("#button-month").append('&nbsp;<span class="caret"></span>');
        $("#button-year").val(currentYear);
        $("#button-month").val(moment(currentMonth+1, 'MM').format('MMMM'));

        for (var i = 1; i <= 3; i++) {
            $("#dropdown-year").append(
                $('<li><a data-val='+currentYear+' href="#">'+currentYear+'</a></li>')
            );
            currentYear--;
        }
        $("#dropdown-year li a").click(function(){
            $("#dropdown-month").html("");
            $("#button-year").text($(this).text());
            $("#button-year").append('&nbsp;<span class="caret"></span>');
            $("#button-year").val($(this).text());
            var selectedYear = $("#button-year").val();
            if (selectedYear != fixYear) {
                allMonths = true;
                var monthList = getmonthList(currentMonth, allMonths);
                prepareMonthDropDown(monthList)
                registerMonthEvent();

            } else {
                allMonths = false;
                var monthList = getmonthList(currentMonth, allMonths);
                prepareMonthDropDown(monthList);
                registerMonthEvent();
            }
        });

        //set upto current month
        var monthList = getmonthList(currentMonth, allMonths);
        prepareMonthDropDown(monthList);
        registerMonthEvent();
    };

    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        init();
        getLoggedInUser();
        createYearSelectBox();
        loadSP();

        function loadSP () {
            getLoggedInUser();
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;

            serviceProviderId = 0;
            if (!loggedInUser.isServiceProvider) {
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getData',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        $("#dropdown-sp").empty();
                        $("#button-sp").text('All Service provider');
						$("#button-sp").append('&nbsp;<span class="caret"></span>');
                        var spItems = '';
                        var spIds = [];
                        var loadedSps = [];
                        spIds.push(serviceProviderId);
                        spItems += '<li><a data-val="0" href="#">All Service provider</a></li>';
                        for (var i = 0; i < data.length; i++) {
                            var sp = data[i];
                            if($.inArray(sp.serviceProviderId, loadedSps) < 0){
                                spItems += '<li><a data-val='+ sp.serviceProviderId +' href="#">' + sp.serviceProvider.replace("@carbon.super","") +'</a></li>'
                                spIds.push(" "+ "\"" + sp.serviceProviderId + "\"");
                                loadedSps.push(sp.serviceProviderId);
                            }
                        }

                        $("#dropdown-sp").html(spItems);

                        $("#button-sp").val('<li><a data-val="0" href="#">All Service provider</a></li>');

                        $("#dropdown-sp li a").click(function(){
                            getLoggedInUser();
                            $("#button-sp").text($(this).text());
                            $("#button-sp").append('&nbsp;<span class="caret"></span>');
                            $("#button-sp").val($(this).text());
                            serviceProviderId = $(this).data('val');

                            if(serviceProviderId != "0"){
                                conf.serviceProvider = serviceProviderId;
                            } else {
                                conf.serviceProvider = spIds;
                            }
                        });
                    }
                });
            }
        }

        $("#button-type").val("Billing");

    });

    function registerMonthEvent () {
        $("#dropdown-month li a").click(function () {
            $("#button-month").text($(this).text());
            $("#button-month").append('&nbsp;<span class="caret"></span>');
            $("#button-month").val($(this).data('val'));
        });
    }

    function prepareMonthDropDown (monthList) {
        monthList.forEach(function (row) {
            $("#dropdown-month").append(
                $('<li><a data-val='+row+' href="#">'+row+'</a></li>')
            );
        });
    }
});

function downloadFile(index, type) {
    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        location.href = gadgetLocation + '/gadget-controller.jag?action=get&index=' + index +'&type='+ type;

    });
}

function removeFile(index, type) {
    getGadgetLocation(function(gadget_Location) {
        gadgetLocation = gadget_Location;
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=remove&index=' + index+'&type='+ type,
            method: METHOD.POST,
            contentType: CONTENT_TYPE,
            async: false,
            success: function(data) {
                if(type == 'csv') {
                    $("#list-summery-report").click();
                }
                else if (type == 'csv-error'){
                    $("#list-error-report").click();
                } else {
                    $("#list-the-bill").click();
                }
            }
        });
    });
}

function getmonthList (month, allList) {
    var monthList = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (allList) {
        return monthList;
    } else {
        var monthloadlist = monthList.slice(0, month+1);
        return monthloadlist;
    }
}