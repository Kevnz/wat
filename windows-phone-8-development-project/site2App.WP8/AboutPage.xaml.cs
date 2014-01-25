using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using System.Diagnostics;
using Microsoft.Phone.Tasks;
using System.Windows.Media;
using System.Threading.Tasks;
using System.IO;
using site2App.WP8.Config;

namespace site2App.WP8
{
    public partial class AboutPage : PhoneApplicationPage
    {
        private WebConfig _webConfig;

        public AboutPage()
        {
            InitializeComponent();

            _webConfig = ((App)Application.Current).WebConfig;

            TitleTextBlock.Text = _webConfig.Settings.Title;
            HeaderTextBlock.Text = _webConfig.Settings.Header;

            Visibility darkBackgroundVisibility =
                    (Visibility)Application.Current.Resources["PhoneDarkThemeVisibility"];

            // Write the theme background value.
            if (darkBackgroundVisibility == Visibility.Visible)
            {
                AboutBrowser.Background = new SolidColorBrush(Colors.Black);
            }
            else
            {
                AboutBrowser.Background = new SolidColorBrush(Colors.White);
            }
            AboutBrowser.Visibility = System.Windows.Visibility.Collapsed;
            AboutBrowser.Navigated += AboutBrowser_Navigated;
            AboutBrowser.LoadCompleted += AboutBrowser_LoadCompleted;
        }

        void AboutBrowser_Navigated(object sender, NavigationEventArgs e)
        {
            AboutBrowser.Visibility = System.Windows.Visibility.Visible;
        }

        void AboutBrowser_Navigating(object sender, NavigatingEventArgs e)
        {
            if (e.Uri.OriginalString.Equals("/wpwebapps@microsoft.com"))
            {
                EmailComposeTask ect = new EmailComposeTask();
                ect.Subject = _webConfig.BaseURLString;
                ect.To = "wpwebapps@microsoft.com";
                ect.Show();
                e.Cancel = true;
            }
            else if (e.Uri.IsAbsoluteUri)
            {
                WebBrowserTask wbt = new WebBrowserTask();
                wbt.Uri = e.Uri;
                wbt.Show();
                e.Cancel = true;
            }
        }

        void AboutBrowser_LoadCompleted(object sender, NavigationEventArgs e)
        {
            Visibility darkBackgroundVisibility =
      (Visibility)Application.Current.Resources["PhoneDarkThemeVisibility"];

            try
            {
                string innerHTML;
                if (!String.IsNullOrEmpty(_webConfig.Settings.HTMLText1))
                {
                    innerHTML = string.Format("document.getElementById('HTMLText1').innerHTML = '{0}'", _webConfig.Settings.HTMLText1);
                    AboutBrowser.InvokeScript("eval", innerHTML);
                }

                if (!string.IsNullOrEmpty(_webConfig.Settings.HTMLText2))
                {
                    innerHTML = string.Format("document.getElementById('HTMLText2').innerHTML = '{0}'", _webConfig.Settings.HTMLText2);
                    AboutBrowser.InvokeScript("eval", innerHTML);
                }

                if (!String.IsNullOrEmpty(_webConfig.Settings.HTMLText3))
                {
                    innerHTML = string.Format("document.getElementById('HTMLText3').innerHTML = '{0}'", _webConfig.Settings.HTMLText3);
                    AboutBrowser.InvokeScript("eval", innerHTML);
                }

                // Write the theme background value.
                if (darkBackgroundVisibility == Visibility.Visible)
                {
                    AboutBrowser.InvokeScript("SetBackground", string.Format("black"));
                    AboutBrowser.InvokeScript("SetForeground", string.Format("white"));
                }
                else
                {
                    AboutBrowser.InvokeScript("SetBackground", string.Format("white"));
                    AboutBrowser.InvokeScript("SetForeground", string.Format("black"));
                }
            }
            catch (Exception exn)
            {
                Debug.WriteLine(exn.ToString());
            }
            AboutBrowser.Navigating += AboutBrowser_Navigating;
        }

        protected override void OnNavigatingFrom(NavigatingCancelEventArgs e)
        {
            AboutBrowser.Navigating -= AboutBrowser_Navigating;
            base.OnNavigatingFrom(e);
        }
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            if (e.NavigationMode == NavigationMode.Back)
            {
                AboutBrowser.Navigate(new Uri("/About.html", UriKind.Relative));
            }
        }
    }
}