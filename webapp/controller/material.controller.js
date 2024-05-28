sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox ) {
        "use strict";

        return Controller.extend("materialmasterr.controller.material", {
            onInit: function () {
                this.onReadMatData();
            },

            onReadMatData: function(){
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait..."
                });
                oBusyDialog.open();
                oModel.read("/Materials", {
                        // urlParameters:{
                        //     "$expand": "supplier"
                        // },
                    success: function(response){
                        oBusyDialog.close();
                        oJSONModel.setData(response.results);
                        this.getView().setModel(oJSONModel, "matdata");
                    }.bind(this),
                    error: function(error){
                        oBusyDialog.close();
                    }
                });
            },

            onNavToDetails: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var smaterial = oEvent.getSource().getCells()[1].getText();
                oRouter.navTo("supplier2",{MaterialName: smaterial});
            },

            onSearch: function(oEvent){
                var aFilters = [];
                var sQuery = oEvent.getParameter("query");
                if(sQuery){
                    aFilters.push(new sap.ui.model.Filter("MaterialName", sap.ui.model.FilterOperator.Contains, sQuery));
                }
                var oTable =this.byId("Table1");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
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
                if(!this.oDialog1) {
                    this.loadFragment({
                        name: "materialmasterr.fragments.add"
                    }).then(function(oDialog1) {
                        this.oDialog1 = oDialog1;
                        this.oDialog1.open();
                    }.bind(this));
                }else{
                    this.oDialog1.open();
                }
            },

            savedata1: function() {
                this.oDialog1.close();

                var z = this.byId("matId2");
                var fmatid = z.getValue();
                var b = this.byId("MatName2");
                var fname = b.getValue();
                var c = this.byId("Quan2");
                var fquan = c.getValue();
                var d = this.byId("des2");
                var fdes = d.getValue();
                var e = this.byId("cost2");
                var fcost = e.getValue()
               
                var record = {
                    "MaterialId": fmatid,
                    "MaterialName": fname,
                    "Quantity": fquan,
                    "Description": fdes,
                    "UnitPrice": fcost,
                }
               
                console.log(record);
                jQuery.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: "/v2/odata/v4/catalog/Materials",
                    data: JSON.stringify(record),
                    success: function (data) {
                        MessageBox.success("New material added to the database successfully!", {
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
                var oContext = oEvent.getSource().getBindingContext('matdata').getObject();
                this.getView().setModel(new sap.ui.model.json.JSONModel({
                    "oPayload": oContext
                }),"oPayloadModel");
                if(!this.oDialog) {
                    this.loadFragment({
                        name: "materialmasterr.fragments.update"
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
                oModel.update("/Materials(MaterialId=" + oRecord.MaterialId+",MaterialName='" + oRecord.MaterialName+"')", oRecord, {
                    success: function(){
                        this.oDialog.close();
                        oBusyDialog.close();
                        this.onReadMatData();
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
                var oContext = oEvent.getSource().getBindingContext('matdata').getObject();  
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
                oModel.remove("/Materials(MaterialId=" + oRecord.MaterialId+",MaterialName='" + oRecord.MaterialName+"')", {
                    success: function(response){
                        oBusyDialog.close();
                        this.onReadMatData();
                    }.bind(this),
                    error: function(error){
                        oBusyDialog.close();
                    }
                });
            }
        });
    });