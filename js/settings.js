var RiseVision = RiseVision || {};
RiseVision.Flash = {};

RiseVision.Flash.Settings = (function($,gadgets, i18n) {
  "use strict";

  // private variables
  var _prefs = null;

  // private functions
  function _bind(){
    // Add event handlers
    $("#save").on("click", function() {
      _saveSettings();
    });

    $("#cancel, #settings-close").on("click", function() {
      gadgets.rpc.call("", "rscmd_closeSettings", null);
    });

    $("#help").on("click", function() {
      window.open("http://www.risevision.com/help/users/what-are-gadgets/" +
        "free-gadgets/rise-vision-flash/", "_blank");
    });
  }

  function _getValidationsMap(){
    return {
      "required": {
        fn: RiseVision.Common.Validation.required,
        localize: "validation.required",
        conditional: null
      },
      "url": {
        fn: RiseVision.Common.Validation.url,
        localize: "validation.valid_url",
        conditional: null
      }
    }
  }

  function _getAdditionalParams(){
    var additionalParams = {};

    additionalParams["url"] = $("#url").val();

    return additionalParams;
  }

  function _getParams(){
    var params = "&up_fileType=" + $("#fileType").val();

    return params;
  }

  function _saveSettings(){
    var settings = null;

    // validate
    if(!_validate()){
      $("#settings-alert").show();
      $(".widget-wrapper").scrollTop(0);
    } else {
      //construct settings object
      settings = {
        "params" : _getParams(),
        "additionalParams" : JSON.stringify(_getAdditionalParams())
      }

      gadgets.rpc.call("", "rscmd_saveSettings", null, settings);
    }
  }

  function _validate(){
    var itemsToValidate = [
          { el: document.getElementById("url"),
            rules: "required|url",
            fieldName: "URL"
          }
        ],
        passed = true;

    $("#settings-alert").empty().hide();

    for(var i = 0; i < itemsToValidate.length; i++){
      if(!_validateItem(itemsToValidate[i])){
        passed = false;
        break;
      }
    }

    return passed;
  }

  function _validateItem(item){
    var rules = item.rules.split('|'),
        validationsMap = _getValidationsMap(),
        alerts = document.getElementById("settings-alert"),
        passed = true;

    for (var i = 0, ruleLength = rules.length; i < ruleLength; i++) {
      var rule = rules[i];

      if (validationsMap[rule].fn.apply(null,
        [item.el,validationsMap[rule].conditional]) === false) {
        passed = false;
        alerts.innerHTML = i18n.t(validationsMap[rule].localize,
          { fieldName: item.fieldName });
        break;
      }
    }

    return passed;
  }

  // public space
  return {
    init: function(){

      _bind();

      $("#settings-alert").hide();

      //Request additional parameters from the Viewer.
      gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {

        _prefs = new gadgets.Prefs();

        if (result) {
          result = JSON.parse(result);

          $("#fileType").val(_prefs.getString("fileType"));

          //Additional params
          $("#url").val(result["url"]);

        }

        i18n.init({ fallbackLng: "en" }, function(t) {
          $(".widget-wrapper").i18n().show();
          $(".form-control").selectpicker();

          // Set tooltips only after i18n has shown
          $("label[for='fileType'] + button").popover({trigger:'click'});

          //Set buttons to be sticky only after wrapper is visible.
          $(".sticky-buttons").sticky({
              container : $(".widget-wrapper"),
              topSpacing : 41,	//top margin + border of wrapper
              getWidthFrom : $(".widget-wrapper")
          });

        });
      });
    }
  };
})($,gadgets, i18n);

RiseVision.Flash.Settings.init();

