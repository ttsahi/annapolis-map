/**
 * Created by tzachit on 17/11/14.
 */

(function(module, Cesium){

    'use strict';

    module.factory('Map', [function(){

        function MapService(container){
            this._viewer = new Cesium.Viewer(container);
            this._billboards = this._viewer.scene.primitives.add(new Cesium.BillboardCollection());
            this._labels = this._viewer.scene.primitives.add(new Cesium.LabelCollection());
        }

        Object.defineProperties(MapService.prototype, {
            markers: {
                get: function(){ return this._billboards; }
            },
            labels: {
                get: function(){ return this._labels; }
            }
        });

        return MapService;
    }]);

}(angular.module('annapolis-map'), Cesium));