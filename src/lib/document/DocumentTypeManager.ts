
export let managers: { [key: string]: DocumentTypeManager } = {}

export interface ComponentProps {
    url: string,
    document_id?: string
}

export default abstract class DocumentTypeManager {

    constructor(type: string) {
        managers[type] = this;
    }

    abstract getComponent(): [any, ComponentProps];
}