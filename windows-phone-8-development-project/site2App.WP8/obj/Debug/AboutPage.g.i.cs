﻿#pragma checksum "C:\Users\mashapir\Source\Repos\Web App Template3\development-project\site2App.WP8\site2App.WP8\AboutPage.xaml" "{406ea660-64cf-4c82-b6f0-42d48172a799}" "6C83E4680C273E5C47C184C549A6CB5C"
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.34003
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using Microsoft.Phone.Controls;
using System;
using System.Windows;
using System.Windows.Automation;
using System.Windows.Automation.Peers;
using System.Windows.Automation.Provider;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Resources;
using System.Windows.Shapes;
using System.Windows.Threading;


namespace site2App.WP8 {
    
    
    public partial class AboutPage : Microsoft.Phone.Controls.PhoneApplicationPage {
        
        internal System.Windows.Controls.Grid LayoutRoot;
        
        internal System.Windows.Controls.TextBlock TitleTextBlock;
        
        internal System.Windows.Controls.TextBlock HeaderTextBlock;
        
        internal System.Windows.Controls.Grid ContentPanel;
        
        internal Microsoft.Phone.Controls.WebBrowser AboutBrowser;
        
        private bool _contentLoaded;
        
        /// <summary>
        /// InitializeComponent
        /// </summary>
        [System.Diagnostics.DebuggerNonUserCodeAttribute()]
        public void InitializeComponent() {
            if (_contentLoaded) {
                return;
            }
            _contentLoaded = true;
            System.Windows.Application.LoadComponent(this, new System.Uri("/site2App.WP8;component/AboutPage.xaml", System.UriKind.Relative));
            this.LayoutRoot = ((System.Windows.Controls.Grid)(this.FindName("LayoutRoot")));
            this.TitleTextBlock = ((System.Windows.Controls.TextBlock)(this.FindName("TitleTextBlock")));
            this.HeaderTextBlock = ((System.Windows.Controls.TextBlock)(this.FindName("HeaderTextBlock")));
            this.ContentPanel = ((System.Windows.Controls.Grid)(this.FindName("ContentPanel")));
            this.AboutBrowser = ((Microsoft.Phone.Controls.WebBrowser)(this.FindName("AboutBrowser")));
        }
    }
}

