package com.bokharest.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "BokharestApp";
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Prevent initial white flash by setting black background
        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        setContentView(webView);

        // Official Google AndroidX WebViewAssetLoader
        // Serves local assets via virtual https://appassets.androidplatform.net/
        // Ensuring full ES Modules support, LocalStorage, IndexedDB & Firebase compatibility
        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setSupportMultipleWindows(false);
        webSettings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("BokharestJS", consoleMessage.message() + " -- Line "
                    + consoleMessage.lineNumber() + " of "
                    + consoleMessage.sourceId());
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    Uri url = request.getUrl();

                    // 1. Try standard WebViewAssetLoader
                    WebResourceResponse response = assetLoader.shouldInterceptRequest(url);
                    if (response != null) {
                        return response;
                    }

                    // 2. Direct fallback for any appassets.androidplatform.net request
                    if ("appassets.androidplatform.net".equals(url.getHost())) {
                        String path = url.getPath();
                        if (path != null) {
                            if (path.startsWith("/")) path = path.substring(1);
                            if (path.startsWith("assets/")) path = path.substring("assets/".length());
                            if (path.isEmpty()) path = "index.html";

                            try {
                                java.io.InputStream is = getAssets().open(path);
                                String mime = "text/plain";
                                if (path.endsWith(".html")) mime = "text/html";
                                else if (path.endsWith(".js") || path.endsWith(".mjs")) mime = "application/javascript";
                                else if (path.endsWith(".css")) mime = "text/css";
                                else if (path.endsWith(".png")) mime = "image/png";
                                else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) mime = "image/jpeg";
                                else if (path.endsWith(".svg")) mime = "image/svg+xml";
                                else if (path.endsWith(".webp")) mime = "image/webp";
                                else if (path.endsWith(".json")) mime = "application/json";
                                return new WebResourceResponse(mime, "UTF-8", is);
                            } catch (Exception e) {
                                Log.w(TAG, "Asset fallback not found: " + path);
                            }
                        }
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                Log.e(TAG, "WebView Error (" + errorCode + "): " + description + " URL: " + failingUrl);

                // Fallback to direct file:/// URL if virtual domain ever fails
                if (failingUrl != null && failingUrl.startsWith("https://appassets.androidplatform.net")) {
                    view.post(() -> view.loadUrl("file:///android_asset/index.html"));
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                String url = request.getUrl().toString();

                if (url.startsWith("whatsapp://") ||
                    url.startsWith("https://wa.me/") ||
                    url.startsWith("https://api.whatsapp.com/") ||
                    url.startsWith("tel:") ||
                    url.startsWith("mailto:") ||
                    url.startsWith("https://maps.google.com") ||
                    url.startsWith("https://maps.app.goo.gl")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception ignored) {
                        return false;
                    }
                }
                return false;
            }
        });

        // Load through virtual secure HTTPS domain for full ES Module & Storage support
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }
}
