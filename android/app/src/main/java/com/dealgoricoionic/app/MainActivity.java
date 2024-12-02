package com.dealgoricoionic.app;

import android.os.Bundle;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public void onCreate(Bundle saveInstanceState){
        super.onCreate(saveInstanceState);
        registerPlugin(GoogleAuth.class);
    }

}
