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

        return Controller.extend("materialmasterr.controller.supplier", {
            onInit: function () {
                this.onReadSupData();
            },

            onReadSupData: function(){
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait..."
                });
                oBusyDialog.open();
                oModel.read("/Suppliers", {
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

            onNavToEnd: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var sSupplierId = oEvent.getSource().getCells()[0].getText();
                oRouter.navTo("supend",{SupplierId: sSupplierId});
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
            }
        });
    });