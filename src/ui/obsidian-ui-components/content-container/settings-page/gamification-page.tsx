import { Notice, SecretComponent, Setting, SettingGroup } from "obsidian";

import { DataManager } from "src/data/data-manager";
// import { DEFAULT_SETTINGS } from "src/data/settings";
import { SettingsManager } from "src/data/settings-manager";
// import { t, tHTML } from "src/lang/helpers";
import { t } from "src/lang/helpers";
import SRPlugin from "src/main";
import { SettingsPage } from "src/ui/obsidian-ui-components/content-container/settings-page/settings-page";
import { SettingsPageType } from "src/ui/obsidian-ui-components/content-container/settings-page/settings-page-manager";

/**
 * Represents a notes settings page.
 *
 * @class NotesPage
 * @extends {SettingsPage}
 */
export class GamificationPage extends SettingsPage {
    constructor(
        pageContainerEl: HTMLElement,
        plugin: SRPlugin,
        settingsManager: SettingsManager,
        dataManager: DataManager,
        pageType: SettingsPageType,
        applySettingsUpdate: (callback: () => unknown) => void,
        display: () => void,
        openPage: (pageType: SettingsPageType) => void,
        scrollListener: (scrollPosition: number) => void,
    ) {
        super(
            pageContainerEl,
            plugin,
            settingsManager,
            dataManager,
            pageType,
            applySettingsUpdate,
            display,
            openPage,
            scrollListener,
        );

        new SettingGroup(this.containerEl)
            .setHeading(t("GROUP_HABITICA"))
            .addSetting((setting: Setting) => {
                setting
                    .setName(t("ENABLE_HABITICA_INTEGRATION"))
                    .setDesc(t("ENABLE_HABITICA_INTEGRATION_DESC"))
                    .addToggle((toggle) =>
                        toggle
                            .setValue(this.settingsManager.settings.enableHabiticaIntegration)
                            .onChange((value) => {
                                applySettingsUpdate(async () => {
                                    this.settingsManager.settings.enableHabiticaIntegration = value;
                                    await this.settingsManager.save();

                                    this.display();
                                });
                            }),
                    );
            })
            .addSetting((setting: Setting) => {
                setting
                    .setName(t("HABITICA_USER_ID"))
                    .setDesc(t("HABITICA_USER_ID_DESC"))
                    .addComponent((el) =>
                        new SecretComponent(this.plugin.app, el)
                            .setValue(this.settingsManager.settings.habiticaUserId)
                            .onChange(async (value) => {
                                this.settingsManager.settings.habiticaUserId = value;
                                await this.settingsManager.save();
                            }),
                    )
                    .setDisabled(!this.settingsManager.settings.enableHabiticaIntegration);
            })
            .addSetting((setting: Setting) => {
                setting
                    .setName(t("HABITICA_API_TOKEN"))
                    .setDesc(t("HABITICA_API_TOKEN_DESC"))
                    .addComponent((el) =>
                        new SecretComponent(this.plugin.app, el)
                            .setValue(this.settingsManager.settings.habiticaApiToken)
                            .onChange(async (value) => {
                                this.settingsManager.settings.habiticaApiToken = value;
                                await this.settingsManager.save();
                            }),
                    )
                    .setDisabled(!this.settingsManager.settings.enableHabiticaIntegration);
            })
            .addSetting((setting: Setting) => {
                setting
                    .setName(t("HABITICA_EASY_TASK_ID"))
                    .setDesc(t("HABITICA_EASY_TASK_ID_DESC"))
                    .addText(
                        (text) =>
                            text
                                .setValue(this.settingsManager.settings.flashcardEasyTaskId)
                                .onChange((value) => {
                                    applySettingsUpdate(async () => {
                                        this.settingsManager.settings.flashcardEasyTaskId = value;
                                        await this.settingsManager.save();
                                    });
                                }),
                        // .inputEl.type = "password"),
                    )
                    .setDisabled(!this.settingsManager.settings.enableHabiticaIntegration);
            })
            .addSetting((setting: Setting) => {
                setting
                    .setName(t("HABITICA_GOOD_TASK_ID"))
                    .setDesc(t("HABITICA_GOOD_TASK_ID_DESC"))
                    .addText(
                        (text) =>
                            text
                                .setValue(this.settingsManager.settings.flashcardGoodTaskId)
                                .onChange((value) => {
                                    applySettingsUpdate(async () => {
                                        this.settingsManager.settings.flashcardGoodTaskId = value;
                                        await this.settingsManager.save();
                                    });
                                }),
                        // .inputEl.type = "password"),
                    )
                    .setDisabled(!this.settingsManager.settings.enableHabiticaIntegration);
            })
            .addSetting((setting: Setting) => {
                setting
                    .setName(t("HABITICA_HARD_TASK_ID"))
                    .setDesc(t("HABITICA_HARD_TASK_ID_DESC"))
                    .addText(
                        (text) =>
                            text
                                .setValue(this.settingsManager.settings.flashcardHardTaskId)
                                .onChange((value) => {
                                    applySettingsUpdate(async () => {
                                        this.settingsManager.settings.flashcardHardTaskId = value;
                                        await this.settingsManager.save();
                                    });
                                }),
                        // .inputEl.type = "password"),
                    )
                    .setDisabled(!this.settingsManager.settings.enableHabiticaIntegration);
            })
            .addSetting((setting: Setting) => {
                setting
                    .setName(t("RETRIEVE_HABITICA_TASK_IDS"))
                    .setDesc(t("RETRIEVE_HABITICA_TASK_IDS_DESC"))
                    .addButton((button) =>
                        button
                            .setButtonText(t("RETRIEVE_TASK_IDS"))
                            .onClick(async () => {
                                await this.retrieveHabiticaTaskIds();
                            })
                            .setDisabled(
                                !this.settingsManager.settings.habiticaUserId ||
                                !this.settingsManager.settings.habiticaApiToken,
                            ),
                    )
                    .setDisabled(!this.settingsManager.settings.enableHabiticaIntegration);
            });
    }
    private async retrieveHabiticaTaskIds(): Promise<void> {
        const userId = this.plugin.app.secretStorage.getSecret(this.settingsManager.settings.habiticaUserId);
        const apiToken = this.plugin.app.secretStorage.getSecret(
            this.settingsManager.settings.habiticaApiToken,
        );

        if (!userId || !apiToken) {
            new Notice("Please set Habitica User ID and API Token first");
            return;
        }

        const url = "https://habitica.com/api/v3/tasks/user?type=habits";

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-user": userId,
                    "x-api-key": apiToken,
                    "x-client": `${userId}-obsidian-spaced-repetition`,
                },
            });

            const body = (await response.json()) as { success?: boolean; message?: string; error?: string; data?: unknown };

            if (!response.ok || body.success === false) {
                const message = body?.message || `HTTP ${response.status}`;
                const error = body?.error ? ` (${body.error})` : "";
                new Notice(`Habitica API error${error}: ${message}`);
                return;
            }

            const habits = body?.data;
            if (!Array.isArray(habits)) {
                new Notice("Invalid response from Habitica API");
                return;
            }

            const taskMapping: Record<string, keyof typeof this.settingsManager.settings> = {
                "Spaced Repetition Easy": "flashcardEasyTaskId",
                "Spaced Repetition Good": "flashcardGoodTaskId",
                "Spaced Repetition Hard": "flashcardHardTaskId",
            };

            let foundCount = 0;

            for (const habit of habits) {
                if (typeof habit.text === "string" && habit.text in taskMapping) {
                    const settingKey = taskMapping[habit.text];
                    (this.settingsManager.settings[settingKey] as string) = habit.id;
                    foundCount++;
                }
            }

            if (foundCount > 0) {
                await this.settingsManager.save();
                this.display();
                new Notice(
                    `Successfully retrieved ${foundCount} task ID${foundCount > 1 ? "s" : ""} from Habitica`,
                );
            } else {
                new Notice(
                    "No matching tasks found. Please create habits named 'Spaced Repetition Easy', 'Spaced Repetition Good', and 'Spaced Repetition Hard' in Habitica.",
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            new Notice(`Error retrieving Habitica tasks: ${message}`);
        }
    }
}
