/**
 * Mobile Intelligence Engine
 *
 * Specialized engine for mobile application development across platforms.
 * Provides comprehensive analysis and best practices for React Native, Flutter,
 * native iOS/Android, performance optimization, and mobile-specific concerns.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  QualityAnalysis,
  MaintainabilityAnalysis,
  PerformanceAnalysis,
  SecurityAnalysis,
  TechnologyInsights,
} from '../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../UnifiedCodeIntelligenceEngine.js';

/**
 * Mobile-specific analysis interfaces
 */
export interface MobilePerformanceAnalysis {
  appStartupTime: {
    measurement: number; // milliseconds
    target: number;
    status: 'good' | 'needs-improvement' | 'poor';
    optimizations: string[];
  };
  memoryUsage: {
    measurement: number; // MB
    target: number;
    status: 'good' | 'needs-improvement' | 'poor';
    optimizations: string[];
  };
  batteryEfficiency: {
    score: number;
    issues: string[];
    optimizations: string[];
  };
  networkEfficiency: {
    score: number;
    caching: boolean;
    compression: boolean;
    offlineSupport: boolean;
    optimizations: string[];
  };
  renderingPerformance: {
    fps: number;
    jankiness: 'low' | 'medium' | 'high';
    optimizations: string[];
  };
  overall: number;
  recommendations: string[];
}

export interface MobileUserExperienceAnalysis {
  touchInteractions: {
    responsiveness: number;
    gestureSupport: boolean;
    feedbackMechanisms: boolean;
    accessibility: boolean;
    score: number;
  };
  accessibility: {
    screenReaderSupport: boolean;
    voiceOverSupport: boolean;
    talkBackSupport: boolean;
    colorContrast: boolean;
    textScaling: boolean;
    keyboardNavigation: boolean;
    score: number;
  };
  responsiveDesign: {
    multipleScreenSizes: boolean;
    orientationSupport: boolean;
    densityIndependence: boolean;
    safeAreaHandling: boolean;
    score: number;
  };
  offlineExperience: {
    offlineCapabilities: boolean;
    dataSync: boolean;
    caching: boolean;
    errorHandling: boolean;
    score: number;
  };
  platformConsistency: {
    materialDesign: boolean;
    humanInterfaceGuidelines: boolean;
    platformSpecificFeatures: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

export interface MobilePlatformIntegrationAnalysis {
  nativeFeatures: {
    camera: boolean;
    geolocation: boolean;
    pushNotifications: boolean;
    biometrics: boolean;
    deviceStorage: boolean;
    contacts: boolean;
    calendar: boolean;
    score: number;
  };
  platformAPIs: {
    iosIntegration: boolean;
    androidIntegration: boolean;
    crossPlatformCompatibility: boolean;
    apiVersionSupport: boolean;
    score: number;
  };
  appStoreOptimization: {
    metadata: boolean;
    screenshots: boolean;
    description: boolean;
    keywords: boolean;
    ratings: boolean;
    score: number;
  };
  deepLinking: {
    customSchemes: boolean;
    universalLinks: boolean;
    appLinks: boolean;
    navigation: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

export interface MobileSecurityAnalysis {
  dataProtection: {
    encryption: boolean;
    secureStorage: boolean;
    keyManagement: boolean;
    dataTransmission: boolean;
    score: number;
  };
  authentication: {
    biometric: boolean;
    multiFactor: boolean;
    oauth: boolean;
    sessionManagement: boolean;
    score: number;
  };
  networkSecurity: {
    certificatePinning: boolean;
    tlsConfiguration: boolean;
    apiSecurity: boolean;
    manInTheMiddleProtection: boolean;
    score: number;
  };
  codeProtection: {
    obfuscation: boolean;
    antiTampering: boolean;
    rootDetection: boolean;
    debuggerDetection: boolean;
    score: number;
  };
  privacyCompliance: {
    gdprCompliance: boolean;
    ccpaCompliance: boolean;
    dataMinimization: boolean;
    consentManagement: boolean;
    score: number;
  };
  overall: number;
  recommendations: string[];
}

/**
 * Mobile-specific intelligence engine
 */
export class MobileIntelligenceEngine extends BaseCategoryIntelligenceEngine {
  category = 'mobile';
  technologies = [
    'React Native',
    'Flutter',
    'Swift',
    'Kotlin',
    'Java',
    'Objective-C',
    'Xamarin',
    'Ionic',
    'Cordova',
    'NativeScript',
    'Unity',
    'Dart',
  ];

  /**
   * Analyze mobile code with platform-specific considerations
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<CodeAnalysis> {
    const insights = await this.getTechnologyInsights(technology, context);

    // Core mobile analysis
    const quality = await this.analyzeMobileQuality(code, technology, insights);
    const maintainability = await this.analyzeMobileMaintainability(code, technology, insights);
    const performance = await this.analyzeMobilePerformance(code, technology, insights);
    const security = await this.analyzeMobileSecurity(code, technology, insights);

    // Mobile-specific analysis
    const mobilePerformance = await this.analyzeMobileSpecificPerformance(
      code,
      technology,
      insights
    );
    const userExperience = await this.analyzeMobileUserExperience(code, technology, insights);
    const platformIntegration = await this.analyzeMobilePlatformIntegration(
      code,
      technology,
      insights
    );
    const mobileSecurityDetailed = await this.analyzeMobileSecurityDetailed(
      code,
      technology,
      insights
    );

    return {
      quality,
      maintainability,
      performance,
      security,
      mobile: {
        performance: mobilePerformance,
        userExperience,
        platformIntegration,
        security: mobileSecurityDetailed,
        overall: this.calculateMobileScore([
          mobilePerformance.overall,
          userExperience.overall,
          platformIntegration.overall,
          mobileSecurityDetailed.overall,
        ]),
      },
    };
  }

  /**
   * Get mobile development best practices
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const insights = await this.getTechnologyInsights(technology, context);
    const platformSpecific = this.getPlatformSpecificPractices(technology);

    return [
      ...insights.bestPractices,
      ...platformSpecific,
      'Implement responsive design for multiple screen sizes',
      'Optimize app startup time and memory usage',
      'Design for offline-first user experience',
      'Follow platform-specific design guidelines',
      'Implement proper error handling and user feedback',
      'Use lazy loading for heavy components',
      'Optimize images and assets for mobile',
      'Implement proper state management',
      'Test on real devices across different platforms',
      'Follow accessibility guidelines (WCAG)',
      'Implement proper data caching strategies',
      'Use platform-appropriate navigation patterns',
      'Optimize battery usage and network requests',
      'Implement secure authentication and data storage',
    ];
  }

  /**
   * Get mobile development anti-patterns
   */
  async getAntiPatterns(_technology: string, _context: Context7Data): Promise<string[]> {
    return [
      'Blocking the main thread with heavy operations',
      'Not optimizing images for different screen densities',
      'Ignoring platform-specific design guidelines',
      'Poor network error handling',
      'Excessive memory usage and memory leaks',
      'Not testing on real devices',
      'Hardcoding screen dimensions',
      'Not implementing proper loading states',
      'Ignoring accessibility requirements',
      'Poor offline experience',
      'Excessive API calls without caching',
      'Not handling different device orientations',
      'Storing sensitive data insecurely',
      'Not optimizing for battery life',
      'Poor touch target sizes',
    ];
  }

  /**
   * Validate mobile code for platform compliance
   */
  async validateCode(code: string, technology: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // React Native specific validations
    if (technology.toLowerCase().includes('react native')) {
      if (code.includes('alert(') && !code.includes('Alert.alert')) {
        warnings.push('Use Alert.alert instead of browser alert() for mobile');
      }
      if (code.includes('console.log') && !code.includes('__DEV__')) {
        suggestions.push('Remove console.log statements in production builds');
      }
      if (code.includes('Dimensions.get') && !code.includes('useDeviceOrientation')) {
        suggestions.push('Consider using hooks for responsive dimension handling');
      }
    }

    // Flutter specific validations
    if (technology.toLowerCase().includes('flutter')) {
      if (code.includes('print(') && !code.includes('kDebugMode')) {
        suggestions.push('Remove print statements in production builds');
      }
      if (code.includes('setState') && code.includes('async')) {
        warnings.push('Avoid calling setState in async functions without checking mounted state');
      }
    }

    // General mobile validations
    if (!code.includes('SafeArea') && !code.includes('safeArea') && !code.includes('EdgeInsets')) {
      suggestions.push('Consider safe area handling for modern devices');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Optimize mobile code for performance and UX
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;
    const insights = await this.getTechnologyInsights(technology, context);

    // Apply mobile-specific optimizations
    if (technology.toLowerCase().includes('react native')) {
      optimizedCode = this.optimizeReactNativeCode(optimizedCode);
    } else if (technology.toLowerCase().includes('flutter')) {
      optimizedCode = this.optimizeFlutterCode(optimizedCode);
    }

    // Apply general mobile optimizations
    optimizedCode = this.applyGeneralMobileOptimizations(optimizedCode);

    return optimizedCode;
  }

  /**
   * Generate mobile-optimized code
   */
  async generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string> {
    const insights = await this.getTechnologyInsights(
      request.techStack?.[0] || 'react native',
      context
    );

    const mobileType = this.detectMobileCodeType(request.featureDescription);
    const platform = this.detectTargetPlatform(request.featureDescription);

    switch (mobileType) {
      case 'react-native-component':
        return this.generateReactNativeComponent(request, insights, platform);
      case 'flutter-widget':
        return this.generateFlutterWidget(request, insights, platform);
      case 'navigation':
        return this.generateNavigationCode(request, insights, platform);
      case 'api-integration':
        return this.generateAPIIntegrationCode(request, insights, platform);
      case 'state-management':
        return this.generateStateManagementCode(request, insights, platform);
      default:
        return this.generateGenericMobileCode(request, insights, platform);
    }
  }

  /**
   * Analyze mobile-specific performance metrics
   */
  private async analyzeMobileSpecificPerformance(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<MobilePerformanceAnalysis> {
    const analysis: MobilePerformanceAnalysis = {
      appStartupTime: {
        measurement: this.estimateStartupTime(code),
        target: 3000, // 3 seconds
        status: 'good',
        optimizations: [],
      },
      memoryUsage: {
        measurement: this.estimateMemoryUsage(code),
        target: 150, // 150MB
        status: 'good',
        optimizations: [],
      },
      batteryEfficiency: {
        score: this.analyzeBatteryEfficiency(code),
        issues: [],
        optimizations: [],
      },
      networkEfficiency: {
        score: this.analyzeNetworkEfficiency(code),
        caching: code.includes('cache') || code.includes('AsyncStorage'),
        compression: code.includes('gzip') || code.includes('compression'),
        offlineSupport: code.includes('offline') || code.includes('NetInfo'),
        optimizations: [],
      },
      renderingPerformance: {
        fps: this.estimateFrameRate(code),
        jankiness: 'low',
        optimizations: [],
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate statuses and generate recommendations
    analysis.appStartupTime.status =
      analysis.appStartupTime.measurement <= analysis.appStartupTime.target
        ? 'good'
        : 'needs-improvement';
    analysis.memoryUsage.status =
      analysis.memoryUsage.measurement <= analysis.memoryUsage.target
        ? 'good'
        : 'needs-improvement';

    if (analysis.appStartupTime.status !== 'good') {
      analysis.appStartupTime.optimizations.push(
        'Reduce bundle size',
        'Implement lazy loading',
        'Optimize initialization code'
      );
    }

    if (analysis.memoryUsage.status !== 'good') {
      analysis.memoryUsage.optimizations.push(
        'Optimize image sizes',
        'Implement memory pooling',
        'Remove memory leaks'
      );
    }

    analysis.overall =
      ((analysis.appStartupTime.status === 'good' ? 100 : 70) +
        (analysis.memoryUsage.status === 'good' ? 100 : 70) +
        analysis.batteryEfficiency.score +
        analysis.networkEfficiency.score +
        analysis.renderingPerformance.fps >
      55
        ? 100
        : 70) / 5;

    analysis.recommendations = this.generatePerformanceRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze mobile user experience
   */
  private async analyzeMobileUserExperience(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<MobileUserExperienceAnalysis> {
    const analysis: MobileUserExperienceAnalysis = {
      touchInteractions: {
        responsiveness: this.analyzeTouchResponsiveness(code),
        gestureSupport:
          code.includes('gesture') || code.includes('Gesture') || code.includes('onSwipe'),
        feedbackMechanisms:
          code.includes('Haptic') || code.includes('vibrat') || code.includes('feedback'),
        accessibility:
          code.includes('accessible') || code.includes('aria-') || code.includes('semantics'),
        score: 0,
      },
      accessibility: {
        screenReaderSupport: code.includes('accessibilityLabel') || code.includes('semanticsLabel'),
        voiceOverSupport: code.includes('VoiceOver') || code.includes('accessibilityHint'),
        talkBackSupport: code.includes('TalkBack') || code.includes('contentDescription'),
        colorContrast: code.includes('contrast') || code.includes('colorScheme'),
        textScaling: code.includes('textScale') || code.includes('fontScale'),
        keyboardNavigation: code.includes('focusable') || code.includes('tabIndex'),
        score: 0,
      },
      responsiveDesign: {
        multipleScreenSizes:
          code.includes('Dimensions') || code.includes('MediaQuery') || code.includes('breakpoint'),
        orientationSupport:
          code.includes('orientation') || code.includes('landscape') || code.includes('portrait'),
        densityIndependence:
          code.includes('dp') || code.includes('dip') || code.includes('PixelRatio'),
        safeAreaHandling:
          code.includes('SafeArea') || code.includes('safeArea') || code.includes('EdgeInsets'),
        score: 0,
      },
      offlineExperience: {
        offlineCapabilities:
          code.includes('offline') || code.includes('NetInfo') || code.includes('connectivity'),
        dataSync: code.includes('sync') || code.includes('queue') || code.includes('background'),
        caching: code.includes('cache') || code.includes('AsyncStorage') || code.includes('SQLite'),
        errorHandling: code.includes('try') && code.includes('catch') && code.includes('network'),
        score: 0,
      },
      platformConsistency: {
        materialDesign:
          code.includes('Material') || code.includes('FAB') || code.includes('Snackbar'),
        humanInterfaceGuidelines:
          code.includes('NavigationBar') || code.includes('TabBar') || code.includes('iOS'),
        platformSpecificFeatures: code.includes('Platform.OS') || code.includes('Platform.select'),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.touchInteractions.score = this.calculateBooleanScore(analysis.touchInteractions);
    analysis.accessibility.score = this.calculateBooleanScore(analysis.accessibility);
    analysis.responsiveDesign.score = this.calculateBooleanScore(analysis.responsiveDesign);
    analysis.offlineExperience.score = this.calculateBooleanScore(analysis.offlineExperience);
    analysis.platformConsistency.score = this.calculateBooleanScore(analysis.platformConsistency);

    analysis.overall =
      (analysis.touchInteractions.score +
        analysis.accessibility.score +
        analysis.responsiveDesign.score +
        analysis.offlineExperience.score +
        analysis.platformConsistency.score) /
      5;

    analysis.recommendations = this.generateUXRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze mobile platform integration
   */
  private async analyzeMobilePlatformIntegration(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<MobilePlatformIntegrationAnalysis> {
    const analysis: MobilePlatformIntegrationAnalysis = {
      nativeFeatures: {
        camera: code.includes('camera') || code.includes('Camera') || code.includes('ImagePicker'),
        geolocation:
          code.includes('geolocation') || code.includes('GPS') || code.includes('location'),
        pushNotifications:
          code.includes('notification') || code.includes('push') || code.includes('FCM'),
        biometrics:
          code.includes('biometric') || code.includes('FaceID') || code.includes('TouchID'),
        deviceStorage:
          code.includes('AsyncStorage') || code.includes('SQLite') || code.includes('Realm'),
        contacts: code.includes('contact') || code.includes('AddressBook'),
        calendar:
          code.includes('calendar') || code.includes('event') || code.includes('CalendarKit'),
        score: 0,
      },
      platformAPIs: {
        iosIntegration:
          code.includes('iOS') || code.includes('swift') || code.includes('objective-c'),
        androidIntegration:
          code.includes('android') || code.includes('kotlin') || code.includes('java'),
        crossPlatformCompatibility:
          code.includes('Platform.OS') || code.includes('Platform.select'),
        apiVersionSupport:
          code.includes('API') && (code.includes('version') || code.includes('SDK')),
        score: 0,
      },
      appStoreOptimization: {
        metadata:
          code.includes('metadata') || code.includes('Info.plist') || code.includes('manifest'),
        screenshots: code.includes('screenshot') || code.includes('preview'),
        description: code.includes('description') || code.includes('summary'),
        keywords: code.includes('keyword') || code.includes('tag'),
        ratings: code.includes('rating') || code.includes('review'),
        score: 0,
      },
      deepLinking: {
        customSchemes: code.includes('scheme://') || code.includes('url-scheme'),
        universalLinks: code.includes('universal') && code.includes('link'),
        appLinks: code.includes('app-link') || code.includes('android:autoVerify'),
        navigation: code.includes('navigation') && code.includes('deep'),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.nativeFeatures.score = this.calculateBooleanScore(analysis.nativeFeatures);
    analysis.platformAPIs.score = this.calculateBooleanScore(analysis.platformAPIs);
    analysis.appStoreOptimization.score = this.calculateBooleanScore(analysis.appStoreOptimization);
    analysis.deepLinking.score = this.calculateBooleanScore(analysis.deepLinking);

    analysis.overall =
      (analysis.nativeFeatures.score +
        analysis.platformAPIs.score +
        analysis.appStoreOptimization.score +
        analysis.deepLinking.score) /
      4;

    analysis.recommendations = this.generatePlatformRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze mobile security in detail
   */
  private async analyzeMobileSecurityDetailed(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<MobileSecurityAnalysis> {
    const analysis: MobileSecurityAnalysis = {
      dataProtection: {
        encryption: code.includes('encrypt') || code.includes('crypto') || code.includes('AES'),
        secureStorage:
          code.includes('Keychain') || code.includes('Keystore') || code.includes('SecureStore'),
        keyManagement:
          code.includes('key') && (code.includes('management') || code.includes('rotation')),
        dataTransmission: code.includes('https') || code.includes('TLS') || code.includes('SSL'),
        score: 0,
      },
      authentication: {
        biometric:
          code.includes('biometric') || code.includes('FaceID') || code.includes('TouchID'),
        multiFactor: code.includes('MFA') || code.includes('2FA') || code.includes('multi-factor'),
        oauth: code.includes('OAuth') || code.includes('OIDC') || code.includes('JWT'),
        sessionManagement:
          code.includes('session') && (code.includes('timeout') || code.includes('refresh')),
        score: 0,
      },
      networkSecurity: {
        certificatePinning: code.includes('pinning') || code.includes('certificate'),
        tlsConfiguration: code.includes('TLS') || (code.includes('SSL') && code.includes('config')),
        apiSecurity: code.includes('API') && (code.includes('auth') || code.includes('token')),
        manInTheMiddleProtection:
          code.includes('MITM') || (code.includes('certificate') && code.includes('validation')),
        score: 0,
      },
      codeProtection: {
        obfuscation: code.includes('obfuscat') || code.includes('minif'),
        antiTampering: code.includes('tamper') || code.includes('integrity'),
        rootDetection: code.includes('root') || code.includes('jailbreak'),
        debuggerDetection: code.includes('debug') && code.includes('detect'),
        score: 0,
      },
      privacyCompliance: {
        gdprCompliance:
          code.includes('GDPR') || (code.includes('privacy') && code.includes('consent')),
        ccpaCompliance: code.includes('CCPA') || code.includes('california'),
        dataMinimization: code.includes('minimal') && code.includes('data'),
        consentManagement: code.includes('consent') && code.includes('manage'),
        score: 0,
      },
      overall: 0,
      recommendations: [],
    };

    // Calculate scores
    analysis.dataProtection.score = this.calculateBooleanScore(analysis.dataProtection);
    analysis.authentication.score = this.calculateBooleanScore(analysis.authentication);
    analysis.networkSecurity.score = this.calculateBooleanScore(analysis.networkSecurity);
    analysis.codeProtection.score = this.calculateBooleanScore(analysis.codeProtection);
    analysis.privacyCompliance.score = this.calculateBooleanScore(analysis.privacyCompliance);

    analysis.overall =
      (analysis.dataProtection.score +
        analysis.authentication.score +
        analysis.networkSecurity.score +
        analysis.codeProtection.score +
        analysis.privacyCompliance.score) /
      5;

    analysis.recommendations = this.generateSecurityRecommendations(analysis);

    return analysis;
  }

  /**
   * Generate React Native component with mobile best practices
   */
  private generateReactNativeComponent(
    request: CodeGenerationRequest,
    _insights: TechnologyInsights,
    _platform: string
  ): string {
    const componentName = this.extractComponentName(request.featureDescription);

    return `import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface ${componentName}Props {
  onPress?: () => void;
  title?: string;
  testID?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onPress,
  title = '${componentName}',
  testID = '${componentName.toLowerCase()}-component',
}) => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Handle focus events for navigation
  useFocusEffect(
    useCallback(() => {
      // Component focused logic
      return () => {
        // Component unfocused cleanup
      };
    }, [])
  );

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert(
        'Action',
        'Button pressed',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    }
  }, [onPress]);

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#6200ea' : undefined}
      />

      <View style={[
        styles.content,
        {
          width: screenData.width,
          minHeight: screenData.height - (StatusBar.currentHeight || 0),
        }
      ]}>
        <Text
          style={styles.title}
          accessible={true}
          accessibilityLabel={\`\${title} title\`}
          accessibilityRole="header"
        >
          {title}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          accessible={true}
          accessibilityLabel="Action button"
          accessibilityRole="button"
          accessibilityHint="Tap to perform action"
          testID={\`\${testID}-button\`}
        >
          <Text style={styles.buttonText}>Press Me</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  button: {
    backgroundColor: '#6200ea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ${componentName};`;
  }

  /**
   * Generate Flutter widget with mobile best practices
   */
  private generateFlutterWidget(
    request: CodeGenerationRequest,
    _insights: TechnologyInsights,
    _platform: string
  ): string {
    const widgetName = this.extractComponentName(request.featureDescription);

    return `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ${widgetName} extends StatefulWidget {
  final String title;
  final VoidCallback? onPressed;
  final Key? key;

  const ${widgetName}({
    this.key,
    this.title = '${widgetName}',
    this.onPressed,
  }) : super(key: key);

  @override
  State<${widgetName}> createState() => _${widgetName}State();
}

class _${widgetName}State extends State<${widgetName}>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTap() {
    // Haptic feedback for better UX
    HapticFeedback.lightImpact();

    // Animation feedback
    _animationController.forward().then((_) {
      _animationController.reverse();
    });

    if (widget.onPressed != null) {
      widget.onPressed!();
    } else {
      _showDefaultDialog();
    }
  }

  void _showDefaultDialog() {
    showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Action'),
          content: const Text('Button was pressed'),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mediaQuery = MediaQuery.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
          semanticsLabel: '\${widget.title} screen',
        ),
        elevation: 0,
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: theme.colorScheme.primary,
          statusBarIconBrightness: theme.brightness == Brightness.dark
              ? Brightness.light
              : Brightness.dark,
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Responsive spacing based on screen size
              SizedBox(height: mediaQuery.size.height * 0.1),

              // Title with responsive text
              Text(
                widget.title,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
                semanticsLabel: '\${widget.title} title',
              ),

              SizedBox(height: 32),

              // Animated button with accessibility
              AnimatedBuilder(
                animation: _scaleAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _scaleAnimation.value,
                    child: ElevatedButton(
                      onPressed: _handleTap,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.primary,
                        foregroundColor: theme.colorScheme.onPrimary,
                        elevation: 2,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        minimumSize: const Size(88, 44), // Minimum touch target
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Press Me',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                        semanticsLabel: 'Press me button',
                      ),
                    ),
                  );
                },
              ),

              // Flexible spacing
              SizedBox(height: mediaQuery.size.height * 0.1),
            ],
          ),
        ),
      ),
    );
  }
}`;
  }

  // Helper methods for analysis
  private getPlatformSpecificPractices(technology: string): string[] {
    if (technology.toLowerCase().includes('react native')) {
      return [
        'Use Platform.OS for platform-specific code',
        'Implement proper safe area handling',
        'Use Flipper for debugging in development',
        'Optimize bundle size with Metro bundler',
        'Use Hermes engine for better performance',
      ];
    } else if (technology.toLowerCase().includes('flutter')) {
      return [
        'Use const constructors for better performance',
        'Implement proper widget lifecycle management',
        'Use Flutter Inspector for UI debugging',
        'Optimize build methods to avoid unnecessary rebuilds',
        'Use Platform.is for platform-specific code',
      ];
    } else if (
      technology.toLowerCase().includes('swift') ||
      technology.toLowerCase().includes('ios')
    ) {
      return [
        'Follow Human Interface Guidelines',
        'Use Auto Layout for responsive design',
        'Implement proper memory management with ARC',
        'Use SwiftUI for modern UI development',
        'Follow iOS app lifecycle patterns',
      ];
    } else if (
      technology.toLowerCase().includes('kotlin') ||
      technology.toLowerCase().includes('android')
    ) {
      return [
        'Follow Material Design guidelines',
        'Use ConstraintLayout for complex layouts',
        'Implement proper activity lifecycle management',
        'Use Jetpack Compose for modern UI development',
        'Follow Android architecture components patterns',
      ];
    }
    return [];
  }

  private calculateMobileScore(scores: number[]): number {
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculateBooleanScore(obj: Record<string, any>): number {
    const values = Object.values(obj).filter(v => typeof v === 'boolean');
    const trueCount = values.filter(Boolean).length;
    return values.length > 0 ? (trueCount / values.length) * 100 : 0;
  }

  private detectMobileCodeType(description: string): string {
    const lower = description.toLowerCase();

    // Prioritize component/widget generation over navigation
    if (lower.includes('component') || lower.includes('screen') || lower.includes('app'))
      return 'react-native-component';
    if (lower.includes('widget') || lower.includes('flutter')) return 'flutter-widget';
    if (lower.includes('navigation') || lower.includes('route')) return 'navigation';
    if (lower.includes('api') || lower.includes('fetch') || lower.includes('request'))
      return 'api-integration';
    if (lower.includes('state') || lower.includes('redux') || lower.includes('context'))
      return 'state-management';
    return 'react-native-component'; // Default to component generation
  }

  private detectTargetPlatform(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) return 'ios';
    if (lower.includes('android')) return 'android';
    return 'cross-platform';
  }

  private extractComponentName(description: string): string {
    // Extract a reasonable component name from description
    const words = description.split(' ').filter(word => /^[A-Za-z]+$/.test(word));
    const name = words
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return name || 'MobileComponent';
  }

  // Performance analysis helpers
  private estimateStartupTime(code: string): number {
    let time = 1000; // Base time
    if (code.includes('import') && code.split('import').length > 10) time += 500;
    if (code.includes('useEffect') && code.split('useEffect').length > 3) time += 300;
    if (code.includes('AsyncStorage') || code.includes('SQLite')) time += 200;
    return Math.min(time, 5000);
  }

  private estimateMemoryUsage(code: string): number {
    let memory = 50; // Base memory in MB
    if (code.includes('Image') && code.split('Image').length > 5) memory += 30;
    if (code.includes('FlatList') || code.includes('ListView')) memory += 20;
    if (code.includes('map') && code.split('map').length > 3) memory += 15;
    return Math.min(memory, 300);
  }

  private analyzeBatteryEfficiency(code: string): number {
    let score = 90;
    if (code.includes('setInterval') || code.includes('Timer')) score -= 20;
    if (code.includes('location') && !code.includes('significant')) score -= 15;
    if (code.includes('background') && code.includes('task')) score -= 10;
    return Math.max(score, 0);
  }

  private analyzeNetworkEfficiency(code: string): number {
    let score = 80;
    if (code.includes('cache') || code.includes('AsyncStorage')) score += 10;
    if (code.includes('retry') || code.includes('exponential')) score += 5;
    if (code.includes('pagination') || code.includes('lazy')) score += 5;
    return Math.min(score, 100);
  }

  private estimateFrameRate(code: string): number {
    let fps = 60; // Target 60 FPS
    if (code.includes('Image') && code.split('Image').length > 10) fps -= 5;
    if (code.includes('ScrollView') && !code.includes('removeClippedSubviews')) fps -= 3;
    if (code.includes('setTimeout') || code.includes('setInterval')) fps -= 5;
    return Math.max(fps, 30);
  }

  private analyzeTouchResponsiveness(code: string): number {
    let score = 80;
    if (code.includes('onPress') || code.includes('TouchableOpacity')) score += 10;
    if (code.includes('delayPressIn') || code.includes('delayPressOut')) score += 5;
    if (code.includes('Gesture') || code.includes('PanGestureHandler')) score += 5;
    return Math.min(score, 100);
  }

  // Analysis-specific methods for mobile features
  private async analyzeMobileQuality(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<QualityAnalysis> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 85;

    // Mobile-specific quality checks
    if (!code.includes('SafeArea') && !code.includes('SafeAreaView')) {
      issues.push('Missing safe area handling for modern devices');
      score -= 10;
    }

    if (!code.includes('accessible') && !code.includes('semantics')) {
      suggestions.push('Add accessibility labels and hints');
      score -= 5;
    }

    if (code.includes('alert(') && !code.includes('Alert.alert')) {
      issues.push('Using browser alert instead of mobile-appropriate Alert');
      score -= 5;
    }

    return {
      score: Math.max(score, 0),
      issues,
      suggestions,
    };
  }

  private async analyzeMobileMaintainability(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<MaintainabilityAnalysis> {
    let score = 80;
    const suggestions: string[] = [];

    // Check for component size
    const lines = code.split('\n').length;
    if (lines > 200) {
      suggestions.push('Consider breaking large components into smaller ones');
      score -= 10;
    }

    // Check for prop types or TypeScript
    if (!code.includes('interface') && !code.includes('PropTypes')) {
      suggestions.push('Add type definitions for better maintainability');
      score -= 5;
    }

    return {
      score: Math.max(score, 0),
      complexity: lines > 150 ? 8 : 5,
      readability: code.includes('//') || code.includes('/*') ? 8 : 6,
      testability: code.includes('testID') || code.includes('test') ? 8 : 5,
      suggestions,
    };
  }

  private async analyzeMobilePerformance(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<PerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 85;

    // Check for performance issues
    if (code.includes('console.log') && !code.includes('__DEV__')) {
      bottlenecks.push('Console logs in production code');
      optimizations.push('Remove console.log statements from production builds');
      score -= 5;
    }

    if (code.includes('ScrollView') && !code.includes('removeClippedSubviews')) {
      bottlenecks.push('ScrollView without removeClippedSubviews optimization');
      optimizations.push('Add removeClippedSubviews prop to ScrollView');
      score -= 5;
    }

    return {
      score: Math.max(score, 0),
      bottlenecks,
      optimizations,
    };
  }

  private async analyzeMobileSecurity(
    code: string,
    _technology: string,
    _insights: TechnologyInsights
  ): Promise<SecurityAnalysis> {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 90;

    // Security checks
    if (code.includes('http://') && !code.includes('localhost')) {
      vulnerabilities.push('Insecure HTTP connections detected');
      recommendations.push('Use HTTPS for all network requests');
      score -= 15;
    }

    if (code.includes('AsyncStorage') && code.includes('password')) {
      vulnerabilities.push('Potential sensitive data in AsyncStorage');
      recommendations.push('Use secure storage for sensitive data');
      score -= 10;
    }

    return {
      score: Math.max(score, 0),
      vulnerabilities,
      recommendations,
      compliance: ['Mobile Security Best Practices'],
    };
  }

  // Optimization methods
  private optimizeReactNativeCode(code: string): string {
    let optimized = code;

    // Add React.memo for functional components
    if (
      optimized.includes('const ') &&
      optimized.includes(': React.FC') &&
      !optimized.includes('React.memo')
    ) {
      optimized = optimized.replace(/export default (\w+);$/m, 'export default React.memo($1);');
    }

    // Add removeClippedSubviews to ScrollView
    if (optimized.includes('<ScrollView') && !optimized.includes('removeClippedSubviews')) {
      optimized = optimized.replace(/<ScrollView/g, '<ScrollView removeClippedSubviews={true}');
    }

    return optimized;
  }

  private optimizeFlutterCode(code: string): string {
    let optimized = code;

    // Add const constructors where possible
    if (optimized.includes('Text(') && !optimized.includes('const Text(')) {
      optimized = optimized.replace(/Text\(/g, 'const Text(');
    }

    return optimized;
  }

  private applyGeneralMobileOptimizations(code: string): string {
    let optimized = code;

    // Remove console.log statements
    optimized = optimized.replace(/console\.log\([^)]*\);?\n?/g, '');

    // Add performance comments
    if (!optimized.includes('// Performance optimized')) {
      optimized = '// Performance optimized for mobile\n' + optimized;
    }

    return optimized;
  }

  // Recommendation generators
  private generatePerformanceRecommendations(analysis: MobilePerformanceAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.appStartupTime.status !== 'good') {
      recommendations.push('Optimize app startup time with lazy loading and bundle splitting');
    }
    if (analysis.memoryUsage.status !== 'good') {
      recommendations.push(
        'Reduce memory usage by optimizing images and implementing memory pooling'
      );
    }
    if (analysis.batteryEfficiency.score < 80) {
      recommendations.push(
        'Improve battery efficiency by reducing background tasks and location requests'
      );
    }
    if (!analysis.networkEfficiency.caching) {
      recommendations.push('Implement caching strategies to reduce network requests');
    }

    return recommendations;
  }

  private generateUXRecommendations(analysis: MobileUserExperienceAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.accessibility.score < 80) {
      recommendations.push('Improve accessibility with screen reader support and proper semantics');
    }
    if (analysis.responsiveDesign.score < 80) {
      recommendations.push('Enhance responsive design for multiple screen sizes and orientations');
    }
    if (analysis.offlineExperience.score < 70) {
      recommendations.push('Implement offline capabilities and data synchronization');
    }

    return recommendations;
  }

  private generatePlatformRecommendations(analysis: MobilePlatformIntegrationAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.nativeFeatures.score < 60) {
      recommendations.push('Integrate more native features to enhance user experience');
    }
    if (analysis.deepLinking.score < 50) {
      recommendations.push('Implement deep linking for better navigation and user experience');
    }

    return recommendations;
  }

  private generateSecurityRecommendations(analysis: MobileSecurityAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.dataProtection.score < 80) {
      recommendations.push('Implement stronger data protection with encryption and secure storage');
    }
    if (analysis.authentication.score < 70) {
      recommendations.push('Enhance authentication with biometric and multi-factor options');
    }
    if (analysis.networkSecurity.score < 80) {
      recommendations.push(
        'Improve network security with certificate pinning and TLS configuration'
      );
    }

    return recommendations;
  }

  // Code generation helpers
  private generateNavigationCode(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights,
    _platform: string
  ): string {
    return `// Navigation configuration for mobile app
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`;
  }

  private generateAPIIntegrationCode(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights,
    _platform: string
  ): string {
    return `// Mobile API integration with error handling and caching
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

class APIService {
  private baseURL = 'https://api.example.com';
  private cache = new Map();

  async request(endpoint: string, options: RequestInit = {}) {
    const cacheKey = \`\${endpoint}-\${JSON.stringify(options)}\`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      // Try to get from persistent cache
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      throw new Error('No network connection and no cached data available');
    }

    try {
      const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const data = await response.json();

      // Cache the response
      this.cache.set(cacheKey, data);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export const apiService = new APIService();`;
  }

  private generateStateManagementCode(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights,
    _platform: string
  ): string {
    return `// Mobile state management with Context API
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  user: null,
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, error: null };
    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}`;
  }

  private generateGenericMobileCode(
    _request: CodeGenerationRequest,
    _insights: TechnologyInsights,
    _platform: string
  ): string {
    return `// Generic mobile utility code
import { Platform, Dimensions, StatusBar } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export function getScreenDimensions() {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    isLandscape: width > height,
    isTablet: width >= 768,
  };
}

export function getStatusBarHeight(): number {
  if (isIOS) {
    return 44; // Default iOS status bar height
  }
  return StatusBar.currentHeight || 24;
}

export function formatForMobile(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (isIOS) {
    // iOS haptic feedback implementation
    // This would require additional library like react-native-haptic-feedback
  } else {
    // Android vibration
    // This would require Vibration from react-native
  }
}`;
  }
}
