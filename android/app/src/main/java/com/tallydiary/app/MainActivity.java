package com.tallydiary.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SilentAuthPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
