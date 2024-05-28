sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Filter, FilterOperator ) {
        "use strict";

        return Controller.extend("materialmasterr.controller.supplier2", {
            onInit: function () {
                // this.onReadSupData();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("supplier2").attachPatternMatched(this.onReadSupData, this);
            },

            onReadSupData: function(oEvent){
                var smaterial = oEvent.getParameter("arguments").MaterialName;
                console.log(smaterial);
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait..."
                });
                oBusyDialog.open();
                var oFilter = new sap.ui.model.Filter("material_MaterialName", "EQ", smaterial); 
                oModel.read("/Suppliers", {
                    filters:[oFilter],
                    success: function(response){
                        oBusyDialog.close();
                        oJSONModel.setData(response.results);
                        this.getView().setModel(oJSONModel, "supdata");
                    }.bind(this),
                    error: function(error){
                        oBusyDialog.close();
                    }
                });
            },

            onSearch: function(oEvent){
                var aFilters = [];
                var sQuery = oEvent.getParameter("query");
                if(sQuery){
                    aFilters.push(new sap.ui.model.Filter("SupplierName", sap.ui.model.FilterOperator.Contains, sQuery));
                }
                var oTable =this.byId("Table2");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);

                var bFilters = [];
                var bQuery = oEvent.getParameter("query");
                if(bQuery){
                    bFilters.push(new sap.ui.model.Filter("SupplierAddress", sap.ui.model.FilterOperator.Contains, bQuery));
                }
                var oTable =this.byId("Table2");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(bFilters);

                var cFilters = [];
                var cQuery = oEvent.getParameter("query");
                if(cQuery){
                   cFilters.push(new sap.ui.model.Filter("material", sap.ui.model.FilterOperator.Contains, cQuery)); 
                }
                var oTable =this.byId("Table2");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(cFilters);
            },

            onSort: function(){
                var oView = this.getView();
                
                if(! this.byId("groupDialog")){
                    this.loadFragment({ 
                        name: "materialmasterr.fragments.Sort",
                                           
                    }).then(function(oDialog){
                        oView.addDependent(oDialog);
                        oDialog.open();
                        
                    });
                }else{
                    this.byId("groupDialog").open();
                }
            },

            onAdd: function(oEvent){
                if(!this.oDialogg) {
                    this.loadFragment({
                        name: "materialmasterr.fragments.addS"
                    }).then(function(oDialogg) {
                        this.oDialogg = oDialogg;
                        this.oDialogg.open();
                    }.bind(this));
                }else{
                    this.oDialogg.open();
                }
            },

            savedata1: function() {
                this.oDialogg.close();

                var a = this.byId("supId2");
                var fsupid = a.getValue();
                var b = this.byId("supName2");
                var fname = b.getValue();
                var d = this.byId("add2");
                var fadd = d.getValue();
                var e = this.byId("nat2");
                var fnat = e.getValue()
                var f = this.byId("phno2");
                var fphno = f.getValue()
               
                var record = {
                    "SupplierId": fsupid,
                    "SupplierName": fname,
                    "SupplierAddress": fadd,
                    "Country": {"code": fnat},
                    "phone": fphno,
                }
               
                console.log(record);
                jQuery.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: "/v2/odata/v4/catalog/Suppliers",
                    data: JSON.stringify(record),
                    success: function (data) {
                        MessageBox.success("New Supplier added to the database successfully!", {
                            title: "Sucess",
                            onClose: function(sAction){
                            if(sAction === 'OK'){
                                location.reload();
                            }
                        }.bind(this),
                        actions:[sap.m.MessageBox.Action.OK],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        });
                    },
                    error: function (err) {
                        MessageBox.error("Error while saving the data: " + err.responseText);
                    }
                });
            },

            CloseDialog1: function() {
                this.oDialog1.close();
            },

            onUpdate: function(oEvent){
                var oContext = oEvent.getSource().getBindingContext('supdata').getObject();
                this.getView().setModel(new sap.ui.model.json.JSONModel({
                    "oPayload": oContext
                }),"oPayloadModel");
                if(!this.oDialog) {
                    this.loadFragment({
                        name: "materialmasterr.fragments.updateS"
                    }).then(function(oDialog) {
                        this.oDialog = oDialog;
                        this.oDialog.open();
                    }.bind(this));
                }else{
                    this.oDialog.open();
                }
            },

            savedata: function(oRecord) {
                var oModel = this.getOwnerComponent().getModel();
                var oRecord = this.getView().getModel('oPayloadModel').getProperty("/oPayload");
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Updating",
                    text: "Please wait..."
                });
                oBusyDialog.open();
                console.log(oRecord);
                oModel.update("/Suppliers(SupplierId=" + oRecord.SupplierId+")", oRecord, {
                    success: function(){
                        this.oDialog.close();
                        oBusyDialog.close();
                        this.onReadSupData();
                    }.bind(this),
                    error: function(error){
                        oBusyDialog.close();
                    }
                });
            },

            CloseDialog: function() {
                this.oDialog.close();
            },

            onDelete: function(oEvent){
                var oContext = oEvent.getSource().getBindingContext('supdata').getObject();  
                console.log(oContext);                
                MessageBox.confirm("Are you sure you want to delete this record?", {
                    title: "Alert",
                    onClose: function(sAction){
                        if(sAction === 'OK'){
                            console.log("Pressed ok");
                            this.onDeleteRecord(oContext);
                        }
                    }.bind(this),
                    actions:[sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                })
            },

            onDeleteRecord: function(oRecord) {
                var oModel = this.getOwnerComponent().getModel();

                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Deleting",
                    text: "Please wait..."
                });
                oBusyDialog.open();
                console.log(oRecord.MaterialId);
                oModel.remove("/Suppliers(SupplierId=" + oRecord.SupplierId+")", {
                    success: function(response){
                        oBusyDialog.close();
                        this.onReadSupData();
                    }.bind(this),
                    error: function(error){
                        oBusyDialog.close();
                    }
                });
            }
        });
    });