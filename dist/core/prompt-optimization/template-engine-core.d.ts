/**
 * Template Engine Core Functionality
 *
 * Contains the main template engine logic without the large ContextAwareTemplateEngine class
 */
import { TemplateContext, TemplateMetadata, UserProfile, SessionContext } from './template-schemas.js';
/**
 * Base Template Engine
 */
export declare class BaseTemplateEngine {
    protected templates: Map<string, TemplateMetadata & {
        template: string;
    }>;
    protected sessionMemory: Map<string, SessionContext>;
    protected userProfiles: Map<string, UserProfile>;
    constructor();
    /**
     * Initialize Handlebars helpers
     */
    private initializeHandlebarsHelpers;
    /**
     * Add a custom template
     */
    addCustomTemplate(templateData: TemplateMetadata & {
        template: string;
    }): void;
    /**
     * Get all templates
     */
    getAllTemplates(): Array<TemplateMetadata & {
        template: string;
    }>;
    /**
     * Get template by ID
     */
    getTemplate(templateId: string): (TemplateMetadata & {
        template: string;
    }) | null;
    /**
     * Generate template with context
     */
    generateTemplate(templateId: string, context: TemplateContext): string;
    /**
     * Get session context
     */
    getSessionContext(sessionId: string): SessionContext | null;
    /**
     * Update session context
     */
    updateSessionContext(sessionId: string, updates: Partial<SessionContext>): void;
    /**
     * Get user profile
     */
    getUserProfile(userId: string): UserProfile | null;
    /**
     * Update user profile
     */
    updateUserProfile(userId: string, updates: Partial<UserProfile>): void;
}
//# sourceMappingURL=template-engine-core.d.ts.map