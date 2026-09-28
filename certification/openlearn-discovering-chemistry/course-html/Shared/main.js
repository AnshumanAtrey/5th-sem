require.config({
    paths: {
        theme_osep: '../Shared',
        jquery: '../Shared/jquery-3.2.1.min'
    }
});

require(["../Shared/matching_dnd"], function(amd) { amd.init(); });