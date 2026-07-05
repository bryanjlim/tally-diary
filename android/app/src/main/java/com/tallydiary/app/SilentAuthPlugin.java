package com.tallydiary.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.auth.api.identity.AuthorizationRequest;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.common.api.Scope;

import java.util.Collections;

/**
 * Silently obtains a fresh Drive-appdata access token via the Google
 * AuthorizationClient, without any UI. Works only after the user has already
 * granted the scope through the interactive @capawesome/capacitor-google-sign-in
 * flow — Google caches the grant, so authorize() then resolves without a prompt.
 * If the grant is missing or revoked, authResult.hasResolution() is true and we
 * report needsAuth so JS can fall back to the interactive sign-in button.
 */
@CapacitorPlugin(name = "SilentAuth")
public class SilentAuthPlugin extends Plugin {

    private static final String SCOPE = "https://www.googleapis.com/auth/drive.appdata";

    @PluginMethod
    public void authorize(PluginCall call) {
        String clientId = getContext().getString(R.string.server_client_id);

        AuthorizationRequest authRequest = AuthorizationRequest.builder()
            .setRequestedScopes(Collections.singletonList(new Scope(SCOPE)))
            .requestOfflineAccess(clientId)
            .build();

        Identity.getAuthorizationClient(getActivity())
            .authorize(authRequest)
            .addOnSuccessListener(authResult -> {
                JSObject ret = new JSObject();
                if (authResult.hasResolution()) {
                    // Not yet granted (or revoked) — would require UI. Do not launch it.
                    ret.put("accessToken", (String) null);
                    ret.put("needsAuth", true);
                } else {
                    ret.put("accessToken", authResult.getAccessToken());
                    ret.put("needsAuth", false);
                }
                call.resolve(ret);
            })
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }
}
