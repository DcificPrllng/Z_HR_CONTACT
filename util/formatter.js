jQuery.sap.declare("Z_HR_CONTACT.util.formatter");

Z_HR_CONTACT.util.formatter = {
	
	displayPhoneNumber : function(countryCode, number, extn){
		if (number){
			var formatNumber =  "+" + countryCode + " " + number;
			if (extn){
				return formatNumber + ' - ' + extn;
			}
			else
			return formatNumber;
		}
	},
	toLowerCase: function(upperCase){
		if (upperCase){
			return upperCase.toLowerCase();
		}
	}
	
};