package de.dhbwloe.loerrach.campusapp.mapview;

import android.content.Context;
import android.view.MotionEvent;

import org.osmdroid.views.MapView;

public class CustomMapView extends MapView {
    public CustomMapView(Context context) {
        super(context);
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        getParent().requestDisallowInterceptTouchEvent(true);
        return super.dispatchTouchEvent(event);
    }
}
