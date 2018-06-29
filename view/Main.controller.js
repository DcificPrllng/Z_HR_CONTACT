sap.ui.controller("Z_HR_CONTACT.view.Main", {

	onInit: function() {
		if (sap.ui.Device.support.touch === false) {
			this.getView().addStyleClass("sapUiSizeCompact");
		}
		var that = this;
		this.getOwnerComponent().getModel().attachRequestSent(function() {
			var oDialog = that.getView().byId("BusyDialog");
			oDialog.open();
		});
		this.getOwnerComponent().getModel().attachRequestCompleted(function() {
			var oDialog = that.getView().byId("BusyDialog");
			oDialog.close();
		});

		this.loadData();
		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
	},
	loadData: function() {
		//Get Data
		this.getView().bindElement("/Contacts('dummy')");
	},
	onRouteMatched: function() {
		this.loadData();
	},
	onNavBack: function() {
		this.getRouter().navTo("main");
	},
	handleNavBack: function() {
		// navigate back to FLP home
		var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		if (oCrossAppNavigator) {
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		}
	},
	getRouter: function() {
		return this.getOwnerComponent().getRouter();
	},
	showEditField: function(control) {
		this.displayCurrentEditField(); //Any current exisitng field is made display only
		var currentFormElement = control.getSource().getParent();
		var allFormElements = control.getSource().getParent().getParent().getContent();

		//Get Index of current Form element
		var currentFormElementIndex = jQuery.inArray(currentFormElement, allFormElements);
		var editFormElementIndex = currentFormElementIndex + 1;
		allFormElements[currentFormElementIndex].setVisible(false); //Hide the current element
		allFormElements[editFormElementIndex].setVisible(true); //show the edit element

		//copy values from display fields to editable fields
		var currentValues = allFormElements[currentFormElementIndex].getContent()[1].getBindingInfo("text").binding.aValues;

		if (currentFormElementIndex === 5) { //Personal email address
			allFormElements[editFormElementIndex].getContent()[1].getContent()[0].getContent()[0].setValue(allFormElements[currentFormElementIndex]
				.getContent()[1]
				.getText());

		} else { //Work Phone //Work Cell Phone //Home Phone //Personal Cell
			allFormElements[editFormElementIndex].getContent()[1].getContent()[0].getContent()[1].setValue(currentValues[0]);
			allFormElements[editFormElementIndex].getContent()[1].getContent()[0].getContent()[2].setValue(currentValues[1]);

		}
		if (currentFormElementIndex === 1) { //Work Phone Extension
			allFormElements[editFormElementIndex].getContent()[1].getContent()[0].getContent()[3].setValue(currentValues[2]);
		}
	},

	displayCurrentEditField: function() {
		var allFormElements = this.getView().byId("formContainer").getContent();
		for (var i = 2; i < 11; i = i + 2) {
			if (allFormElements[i].getVisible()) {
				allFormElements[i].setVisible(false);
				allFormElements[i - 1].setVisible(true);
			}
		}
	},

	onSingleSave: function(evt) {
		var originalValues = this.getOwnerComponent().getModel().getData("/Contacts('')");
		var currentValues = evt.getSource().getParent().getParent().getContent()[1].getContent()[0].getContent();

		//Anyhting changed?
		var oParams = {};
		var allFormElements = this.getView().byId("formContainer").getContent();
		var currentFormElementIndex = jQuery.inArray(evt.getSource().getParent().getParent(), allFormElements);
		var nothingChanged;
		var currentFormElement = allFormElements[currentFormElementIndex];

		if (currentFormElementIndex === 6) { //Personal email address
			oParams.Type = "PersonalEmail";
			oParams.NewID = currentValues[0].getValue();
			if (oParams.NewID.toLowerCase() === originalValues.PersonalEmail.toLowerCase()) {
				nothingChanged = "X";
			}

		} else if (currentFormElementIndex === 2) { //Work Phone
			oParams.Type = "WorkPhone";
			oParams.NewNumber = {};
			oParams.NewNumber.CountryCode = currentValues[1].getValue();
			oParams.NewNumber.Number = currentValues[2].getValue();
			oParams.NewNumber.Extension = currentValues[3].getValue();
			if ((oParams.NewNumber.CountryCode === originalValues.WorkPhone.CountryCode) && (oParams.NewNumber.Number === originalValues.WorkPhone.Number) &&
				(oParams.NewNumber.Extension === originalValues.WorkPhone.Extension)) {
				nothingChanged = "X";
			}

		} else if (currentFormElementIndex === 4) { //Work Cell Phone
			oParams.Type = "WorkCellNumber";
			oParams.NewNumber = {};
			oParams.NewNumber.CountryCode = currentValues[1].getValue();
			oParams.NewNumber.Number = currentValues[2].getValue();
			if ((oParams.NewNumber.CountryCode === originalValues.WorkCellNumber.CountryCode) && (oParams.NewNumber.Number === originalValues.WorkCellNumber
				.Number)) {
				nothingChanged = "X";
			}
		} else if (currentFormElementIndex === 8) { //Home Phone
			oParams.Type = "HomePhone";
			oParams.NewNumber = {};
			oParams.NewNumber.CountryCode = currentValues[1].getValue();
			oParams.NewNumber.Number = currentValues[2].getValue();
			if ((oParams.NewNumber.CountryCode === originalValues.HomePhone.CountryCode) && (oParams.NewNumber.Number === originalValues.HomePhone.Number)) {
				nothingChanged = "X";
			}
		} else if (currentFormElementIndex === 10) { //Personal Cell
			oParams.Type = "PersonalCellNumber";
			oParams.NewNumber = {};
			oParams.NewNumber.CountryCode = currentValues[1].getValue();
			oParams.NewNumber.Number = currentValues[2].getValue();
			if ((oParams.NewNumber.CountryCode === originalValues.PersonalCellNumber.CountryCode) && (oParams.NewNumber.Number === originalValues.PersonalCellNumber
				.Number)) {
				nothingChanged = "X";
			}
		}

		if (nothingChanged) {
			this.displayCurrentEditField();
			sap.m.MessageToast.show("Nothing changed");
			return; //Nothing to do
		}

		var that = this;
		var oParameters = {};
		oParameters.fnSuccess = function() {
			//Success
			//Upon success, refresh binding to reflect new data. + change the field back to display only + show a message
			that.getOwnerComponent().getModel().refresh();
			that.displayCurrentEditField();
			sap.m.MessageToast.show("Successfully Updated");
		};
		oParameters.fnError = function(error) {
			//Error
			var messageObj = JSON.parse(error.response.body);

			// currentFormElement.getFields()[0].addStyleClass("errorBorder");
			new sap.m.Popover({
				showHeader: false,
				horizontalScrolling: false,
				verticalScrolling: false,
				placement: sap.m.PlacementType.Bottom,
				content: [
					new sap.m.Text({
						text: messageObj.error.message.value
					})
				]
			}).addStyleClass("sapUiSizeCompact").addStyleClass("RedPopover").openBy(currentFormElement.getContent()[1]);

		};
		//newDataS.editData
		//save data back to server
		this.getOwnerComponent().getModel().update("/GenericContacts('dummy')", oParams, oParameters);
	}

});