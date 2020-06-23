package de.dhbwloe.loerrach.campusapp.mapview;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import org.osmdroid.config.Configuration;
import org.osmdroid.config.IConfigurationProvider;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.CustomZoomButtonsController;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;
import org.osmdroid.views.overlay.Overlay;

import java.io.File;

public class AndroidMapView extends SimpleViewManager<MapView> {
    public AndroidMapView(ReactApplicationContext reactContext) {
        IConfigurationProvider osmConf = Configuration.getInstance();
        File basePath = new File(reactContext.getCacheDir().getAbsolutePath(), "osmdroid");
        osmConf.setOsmdroidBasePath(basePath);
        File tileCache = new File(osmConf.getOsmdroidBasePath().getAbsolutePath(), "tile");
        osmConf.setOsmdroidTileCache(tileCache);
        osmConf.setUserAgentValue("CampusAPP-DHBW-LOE");
    }

    @ReactProp(name = "location")
    public void setPosition(MapView view, ReadableMap location) {
        view.post(() -> {
            double latitude = location.getDouble("latitude");
            double longitude = location.getDouble("longitude");
            GeoPoint newPosition = new GeoPoint(latitude, longitude);
            view.getController().setCenter(newPosition);
            for (Overlay o : view.getOverlays()) {
                if (o instanceof Marker) {
                    Marker m = (Marker)o;
                    m.setPosition(newPosition);
                }
            }
        });
    }

    @ReactProp(name = "zoom")
    public void setZoom(MapView view, @Nullable double zoom) {
        view.post(() -> {
            view.getController().setZoom(zoom);
        });
    }

    @NonNull
    @Override
    public String getName() {
        return "AndroidMapView";
    }

    @NonNull
    @Override
    protected MapView createViewInstance(@NonNull ThemedReactContext reactContext) {
        MapView map = new CustomMapView(reactContext);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.getZoomController().setVisibility(CustomZoomButtonsController.Visibility.NEVER);
        map.setMultiTouchControls(true);
        Marker startMarker = new Marker(map);
        map.getOverlays().add(startMarker);
        return map;
    }
}
