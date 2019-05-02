using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Lib.RNLib
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNLibModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNLibModule"/>.
        /// </summary>
        internal RNLibModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNLib";
            }
        }
    }
}
