"use strict";
var NodeHelper = require('node_helper');
const VbbFetcher = require('./VbbFetcher');
const Promise = require('./vendor/bluebird-3.4.5.min');

module.exports = NodeHelper.create({

    start: function(){
        this.departuresFetchers = []
    },

    createFetcher: function(config) {
        this.departuresFetchers.push(new VbbFetcher(config));
    },

    getStationName: function(stationId) {
        this.getFetcherIndex(stationId).then( (index) => {
            this.departuresFetchers[index].getStationName().then( (response) => {

                this.sendSocketNotification('STATION_NAME', response)
            })
        })
    },

    getDepartures: function(stationId){

        this.getFetcherIndex(stationId).then( (index) => {
            this.departuresFetchers[index].fetchDepartures().then( (departuresData) => {

                this.pimpDeparturesArray(departuresData.departuresArray);
                this.sendSocketNotification('DEPARTURES', departuresData)
            })
        });
    },

    pimpDeparturesArray: function (departuresArray) {
        var currentProperties = {};

        departuresArray.forEach( (current) => {
            currentProperties = this.getLineProperties(current);

            //if (!this.config.marqueeLongDirections) {
            //    current.direction = this.trimDirectionString(current.direction);
            //}
            current.color = currentProperties.color;
            current.cssClass = currentProperties.cssClass;
        })

        return departuresArray;
    },

    getFetcherIndex: function (stationId) {
       return new Promise( (resolve,reject) => {
           this.departuresFetchers.findIndex( (element, index) => {
               if (element.getStationId() === stationId) {
                   resolve(index);
               }
           })
       });
    },

    getLineProperties: function(product) {

        var out = {
            color: "#000000",
            cssClass: ""
        }

        var type = product.type;
        var line = product.nr;

        switch (type) {
            case "suburban":
                out.color = this.getSuburbanLineColor(line);
                out.cssClass = "sbahnsign";
                break;
            case "subway":
                out.color = this.getSubwayLineColor(line);
                out.cssClass = "ubahnsign";
                break;
            case "bus":
                out.color = product.color;
                out.cssClass = "bussign";
                break;
            case "tram":
                out.color = product.color;
                out.cssClass = "tramsign";
                break;
            case "regional":
                out.color = product.color;
                out.cssClass = "dbsign";
                break;
        }

        return out;
    },

    getSuburbanLineColor: function(lineNumber) {
        var color;

        switch (lineNumber) {

            case 1:
                color = "#F414A0";
                break;
            case 2:
                color = "#006529";
                break;
            case 3:
                color = "#053983";
                break;
            case 5:
                color = "#FF3E00";
                break;
            case 7:
                color = "#7A3F9D";
                break;
            case 8:
                color = "#00B123";
                break;
            case 9:
                color = "#980026";
                break;
            case 25:
                color = "#006529";
                break;
            case 41:
                color = "#B02C00";
                break;
            case 42:
                color = "#CF6423";
                break;
            case 45:
            case 46:
            case 47:
                color = "#CC8625";
                break;
            case 75:
                color = "#7A3F9D";
                break;
            case 85:
                color = "#00B123";
                break;
        }

        return color;
    },

    getSubwayLineColor: function (lineNumber) {
        var color;

        switch (lineNumber) {
            case 1:
            case 12:
                color = "#7DAD4C";
                break;
            case 2:
                color = "#DA421E";
                break;
            case 3:
                color = "#007A5B";
                break;
            case 4:
                color = "#F0D722";
                break;
            case 5:
            case 55:
                color = "#7E5330";
                break;
            case 6:
                color = "#8C6DAB";
                break;
            case 7:
                color = "#528DBA";
                break;
            case 8:
                color = "#224F86";
                break;
            case 9:
                color = "#F3791D";
                break;
        }

        return color;
    },

    socketNotificationReceived: function(notification, payload) {

        if (notification === 'GET_DEPARTURES') {

            this.getDepartures(payload);

        } else if (notification === 'CREATE_FETCHER') {

            this.createFetcher(payload);
        }
    }
});