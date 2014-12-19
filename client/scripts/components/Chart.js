define([
    'lib/react',
    'lib/clib',
    'components/Graph',
    'stores/EngineVirtualStore'
], function(
    React,
    Clib,
    Graph,
    EngineVirtualStore
){

    var D = React.DOM;

    function getState(){
        return {
            engine: EngineVirtualStore.getState()
        }
    }

    return React.createClass({
        displayName: 'Chart',

        getInitialState: function () {
            return getState();
        },

        _onChange: function() {
            //Check if its mounted because when Game view receives the disconnect event from EngineVirtualStore unmounts all views
            //and the views unregister their events before the event dispatcher dispatch them with the disconnect event
            if(this.isMounted())
                this.setState(getState());
        },

        componentWillMount: function() {
            var width;

            window.onresize=function() {
                if (window.innerWidth > 767) {
                    if((window.innerWidth) < 1000) {
                        width = Math.floor(window.innerWidth * 0.58);
                    } else {
                        width = 600;
                    }
                } else {
                    width = window.innerWidth * 0.9;
                }
                self.graph = new Graph(width, 300);
            };

            if (window.innerWidth > 767) {
                if((window.innerWidth) < 1000) {
                    width = Math.floor(window.innerWidth * 0.58);
                } else {
                    width = 600;
                }
            } else {
                width = window.innerWidth * 0.9;
            }

            this.graph = new Graph(width, 300);
        },

        componentWillUnmount: function() {
            EngineVirtualStore.removeChangeListener(this._onChange);
            this.mounted = false;
        },

        componentDidMount: function() {
            EngineVirtualStore.addChangeListener(this._onChange);

            this.mounted = true;
            this.animRequest = window.requestAnimationFrame(this._draw);
        },

        _draw: function() {
            if(this.mounted) { //TODO: If mounted could be checked with react
                var canvas = this.getDOMNode();
                if (!canvas.getContext) {
                    console.log('No canvas');
                    return;
                }
                var ctx = canvas.getContext('2d');

                this.graph.setData(ctx, canvas, this.state.engine);
                this.graph.calculatePlotValues();
                this.graph.clean();
                this.graph.drawGraph();
                this.graph.drawAxes();
                this.graph.drawGameData();

                this.animRequest = window.requestAnimationFrame(this._draw);
            }
        },

        render: function() {
            return D.canvas({
                width: this.graph.canvasWidth,
                height: this.graph.canvasHeight
            });
        }

    });

});