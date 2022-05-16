//
//  Flanker.m
//  MDCApp
//
//  Created by oleg habchak on 16.05.2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(HelloWorld, NSObject)
RCT_EXTERN_METHOD(ShowMessage:(NSString *)message duration:(double *)duration)
@end
