//
//  Flanker.swift
//  MDCApp
//
//  Created by oleg habchak on 16.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation
import UIKit

@objc(HelloWorld)

class HelloWorld: NSObject, RCTBridgeModule{
  
  static func moduleName() -> String!{
    return "HelloWorld777";
  }
  
  static func requireMainQueueSetup () -> Bool {
    return true;
  }
  
  @objc
  func view() -> UIView {
    let view = UIView()
    view.backgroundColor = .yellow
    return view
  }
  
  @objc
  func ShowMessage(_ message:NSString, duration:Double) -> Void {
    let alert = UIAlertController(title:nil, message: message as String, preferredStyle: .alert);
    let seconds:Double = duration;
    alert.view.backgroundColor = .red
    alert.view.alpha = 0.5
    alert.view.layer.cornerRadius = 14
    
    DispatchQueue.main.async {
      (UIApplication.shared.delegate as? AppDelegate)?.window.rootViewController?.present(alert, animated: true, completion: nil);
    }
    
    DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + seconds, execute: {
      alert.dismiss(animated: true, completion: nil);
    })
  }
}
