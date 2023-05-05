export interface MackerelWebhook {
    orgName: string;
    event: string;
    imageURL: string;
    memo: string;
    alert: MackerelAlert;
    isTestPayload(): boolean;
    isAlertEvent(): boolean;
    isCriticalOrOK(): boolean;
    getID(): string;
    getIncidentTitle(): string;
    toGrafanaOnCallFormattedWebhook(): GrafanaOnCallFormattedWebhook;
}

interface MackerelAlert {
    closedAt: number | null;
    createdAt: number | null;
    criticalThreshold: number;
    duration: number | null;
    id: string;
    isOpen: boolean;
    metricLabel: string;
    metricValue: number;
    monitorName: string;
    monitorOperator: string;
    openedAt: number | null;
    status: string;
    trigger: string;
    url: string;
}

export const newMackerelWebhook = (v: MackerelWebhook): MackerelWebhook => {
    return {
        orgName: v.orgName || "",
        event: v.event || "",
        imageURL: v.imageURL || "",
        memo: v.memo || "",
        alert: v.alert || {
            id: "",
            status: "",
        },
        isTestPayload(): boolean {
            console.log(`orgName: ${this.orgName}, alert.id: ${this.alert.id}, alert.status: ${this.alert.status}`);
            return this.orgName == "" && this.alert.id === "" && this.alert.status === "";
        },
        isAlertEvent(): boolean {
            return this.event === "alert";
        },
        isCriticalOrOK(): boolean {
            const s = this.alert.status.toLowerCase();
            return s === "critical" || s === "ok";
        },
        getID(): string {
            return this.alert.id;
        },
        getIncidentTitle(): string {
            return `[${this.orgName}] ${this.alert.monitorName} is ${this.alert.status}`;
        },
        toGrafanaOnCallFormattedWebhook(): GrafanaOnCallFormattedWebhook {
            return {
                alert_uid: this.alert.id,
                title: this.getIncidentTitle(),
                image_url: this.imageURL,
                state: this.alert.isOpen ? "alerting" : "ok",
                link_to_upstream_details: this.alert.url,
                message: this.memo,
            };
        }
    };
};

export interface GrafanaOnCallFormattedWebhook {
    alert_uid: string | null;
    title: string;
    image_url: string;
    state: string | null;
    link_to_upstream_details: string | null;
    message: string | null;
}

export const GrafanaOnCallFormattedWebhookTestPayload: GrafanaOnCallFormattedWebhook = {
    title: "This is a test webhook from Mackerel",
    state: "ok",
    alert_uid: null,
    image_url: "",
    link_to_upstream_details: null,
    message: null
};
