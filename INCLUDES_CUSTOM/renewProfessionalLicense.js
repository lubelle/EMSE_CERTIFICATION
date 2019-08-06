function renewProfessionalLicense() {
	try {

		var vLicenseType = lookup("LICENSED PROFESSIONAL TYPE LOOKUP", appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/License");
		var newLicId = getParentLicenseCapID(capId);
		var newLicIdString = newLicId.getCustomID();

		if (arguments.length > 0){
			newLicId = aa.cap.getCapID(arguments[0].getCustomID()).getOutput()
			newLicIdString = arguments[0].getCustomID();
			//var thisCapId = aa.cap.getCapID(licNbr).getOutput();
		}

		thisLic = new licenseObject(newLicIdString,newLicId,vLicenseType) ;

		// Get the expiration Date
		var newExpDate;
		newExpDate = calcExpirationDate(thisLic,newLicId);
		thisLic.setExpiration(newExpDate);

		// select statement to update expiration status based on ASI
		thisLic.setStatus("Active");

		var mainParentLicId = getParentByCapId(newLicId);
		if (mainParentLicId) {
			var result = copyExpDateMainToSubLic(mainParentLicId, newLicId, [ 'Licenses/Barbers/Barber Inst/License', 'Licenses/Cosmetology/Cosmetology Inst/License',
					'Licenses/Cosmetology/Cosmetology Ltd Inst/License', 'Licenses/Cosmetology/Electrology Inst/License', 'Licenses/Cosmetology/Electrology Ltd Inst/License',
					'Licenses/Cosmetology/Esthetician Ltd Inst/License', 'Licenses/Cosmetology/Manicuring Ltd Inst/License',
					'Licenses/Cosmetology/Nat Hair Cultivation Ltd Inst/License', 'Licenses/Cosmetology/Cosmetology School Branch/License' ]);
			if (result) newExpDate = result
		}


		// Set the Fingerprint Expiration Date
		setFingerprintExpirationDate(newExpDate,newLicId);

		var licAppStatus = getAppStatus(newLicId);
		var renewedStatus = null;
		switch ("" + licAppStatus) {
			case 'Active - Court Stay':
			case 'Disciplinary Limited':
			case 'Limited':
			case 'Suspended':
				renewedStatus = licAppStatus;
				break;
			default:
				renewedStatus = "Active";
		}
		updateTask("License Status",renewedStatus,"Updated via EMSE Script from " + newLicIdString , "","",newLicId);
		updateAppStatus(renewedStatus,"Updated via EMSE Script from " + newLicIdString, newLicId);
		updateAppNameToContactName("License Holder",newLicId);

	     switch (String(appTypeString))  {
	      case "Licenses/Nursing/Registered Nurse/Renewal" :
	        updateRNSpecialtyCertificationTable(capId,newLicId);
	      	break;
				case "Licenses/Pharmacy/Pharmacist/Renewal" :
	        //updateParentASITSpecialtyPharmacist();
					updatePharmacistSpeciltyASITExpDateAndSync(newLicId);
	      	break;
				case "Licenses/Dentistry/Dentist/Renewal" :
	        updateDentistSpecialtyCertificationTable(capId,newLicId);
	      	break;
				case "Licenses/Dentistry/Dental Hygienist/Renewal" :
	        updateDNSpecialtyCertificationTable(capId,newLicId);
	      	break;
				case "Licenses/Optometry/Optometrist/Renewal" :
	        addOrUpdateOptometristSpecialtyAsit(newLicId);
	      	break;

	     }

			 //Get allowed License Types
	 		var csAndDrugJSON = getScriptText("CONF_CUSTOM_CONTROLLED_SUBSTANCE_AND_DRUG_ALLOWED")
	 		var csAndDrugAllowedLicenses = (csAndDrugJSON == "") ? {} : JSON.parse(csAndDrugJSON)
	 		var thisLicenseType = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + "License"

	 		// Controlled Substance
	 		try {
	 			if (csAndDrugAllowedLicenses.LICENSES_ALLOWED_CONTROLLED_SUBSTANCE.indexOf(thisLicenseType) >= 0) {
	 				/**************************************
	 				* Mike Linscheid
	 				* SMS: PRJAUT-2018-00884
	 				*/
	 				var CSLicenseObj = new CSLicenseObject()
	 				CSLicenseObj.renewalParentLic(capId, newLicId)
	 			}
	 			else {
	 				logDebug("**INFO " + thisLicenseType + " is not allowed to apply for a Controlled Substance License")
	 			}
	 		}
	 		catch(err) {
	 			logDebug("Error checking for " + thisLicenseType + " record type in CONF_CUSTOM_CONTROLLED_SUBSTANCE_AND_DRUG_ALLOWED:" + err.message)
	 		}

	 		//Drug Control
	 		try {
	 			if (csAndDrugAllowedLicenses.LICENSES_ALLOWED_DRUG_CONTROL.indexOf(thisLicenseType) >= 0) {
	 				var DrugControlLicenseObj = new DrugControlLicenseObject()
	 				DrugControlLicenseObj.renewalParentLic(capId, newLicId)
	 			}
	 			else {
	 				logDebug("**INFO " + thisLicenseType + " is not allowed to apply for a Drug Control License")
	 			}
	 		}
	 		catch(err) {
	 			logDebug("Error checking for " + thisLicenseType + " record type in CONF_CUSTOM_CONTROLLED_SUBSTANCE_AND_DRUG_ALLOWED:" + err.message)
	 		}

	 		// Drug Treatment
	 		try {
	 			if (csAndDrugAllowedLicenses.LICENSES_ALLOWED_DRUG_TREATMENT.indexOf(thisLicenseType) >= 0) {
	 				var DrugTreatmentLicenseObj = new DrugTreatmentLicenseObject()
	 				DrugTreatmentLicenseObj.renewalParentLic(capId, newLicId)
	 			}
	 			else {
	 				logDebug("**INFO " + thisLicenseType + " is not allowed to apply for a Drug Treatment License")
	 			}
	 		}
	 		catch(err) {
	 			logDebug("Error checking for " + thisLicenseType + " record type in CONF_CUSTOM_CONTROLLED_SUBSTANCE_AND_DRUG_ALLOWED:" + err.message)
	 		}

	 		// Automated Devices
	 		try {
	 			if (csAndDrugAllowedLicenses.LICENSES_ALLOWED_AUTOMATED_DEVICE.indexOf(thisLicenseType) >= 0) {
	 				var CSDeviceLicenseObj = new CSDeviceLicenseObject()
	 				CSDeviceLicenseObj.renewalParentLic(capId, newLicId)
	 			}
	 			else {
	 				logDebug("**INFO " + thisLicenseType + " is not allowed to apply for an Automated Device License")
	 			}
	 		}
	 		catch(err) {
	 			logDebug("Error checking for " + thisLicenseType + " record type in CONF_CUSTOM_CONTROLLED_SUBSTANCE_AND_DRUG_ALLOWED:" + err.message)
	 		}

	 		//PRJAUT-2019-00130 - Pharmacist Specialty US#3 Yazan Barghouth 4/23/2019
			/*try {
				updatePharmacistSpeciltyASITExpDateAndSync(newLicId);
			}catch(ex){
				logDebug("Error in updatePharmacistSpeciltyASITExpDateAndSync() " + ex)
			}*/

	}
	catch(err) {
		logDebug("Error in renewProfessionalLicense(): " + err.message + ". Line: " + err.lineNumber + ". Stack: " + err.stack)
	}
}

/***********************************RENEWAL FUNCTIONS***************************************************/
