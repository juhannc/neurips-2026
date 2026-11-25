import plistlib
import uuid
from pathlib import Path


def uid():
    return str(uuid.uuid4()).upper()


def action(identifier, params):
    return {
        "WFWorkflowActionIdentifier": identifier,
        "WFWorkflowActionParameters": {"UUID": uid(), **params},
    }


def reference(src, output="Dictionary Value"):
    return {
        "Type": "ActionOutput",
        "OutputUUID": src["WFWorkflowActionParameters"]["UUID"],
        "OutputName": output,
    }


def attachment(value):
    return {"WFSerializationType": "WFTextTokenAttachment", "Value": value}


def token(value):
    return {
        "WFSerializationType": "WFTextTokenString",
        "Value": {
            "string": "\uFFFC",
            "attachmentsByRange": {"{0, 1}": value},
        },
    }


actions = []
dictionary = action(
    "is.workflow.actions.detect.dictionary",
    {"WFInput": attachment({"Type": "ExtensionInput"})},
)
actions.append(dictionary)
values = {}
for key in ("title", "start", "end", "location", "notes"):
    item = action(
        "is.workflow.actions.getvalueforkey",
        {
            "WFDictionaryKey": key,
            "WFGetDictionaryValueType": "Value",
            "WFInput": attachment(reference(dictionary, "Dictionary")),
        },
    )
    actions.append(item)
    values[key] = token(reference(item))

actions.append(
    action(
        "is.workflow.actions.addnewevent",
        {
            "WFCalendarItemTitle": values["title"],
            "WFCalendarItemLocation": values["location"],
            "WFCalendarItemDates": True,
            "WFCalendarItemStartDate": values["start"],
            "WFCalendarItemEndDate": values["end"],
            "WFCalendarItemNotes": values["notes"],
            "WFCalendarItemAllDay": False,
            "WFShowComposeSheet": True,
        },
    )
)

workflow = {
    "WFWorkflowActions": actions,
    "WFWorkflowClientVersion": "5037.0.17",
    "WFWorkflowMinimumClientVersion": 900,
    "WFWorkflowMinimumClientVersionString": "900",
    "WFWorkflowIcon": {
        "WFWorkflowIconStartColor": 431817727,
        "WFWorkflowIconGlyphNumber": 61440,
    },
    "WFWorkflowTypes": [],
    "WFQuickActionSurfaces": [],
    "WFWorkflowInputContentItemClasses": ["WFStringContentItem"],
    "WFWorkflowOutputContentItemClasses": [],
    "WFWorkflowImportQuestions": [],
    "WFWorkflowHasShortcutInputVariables": True,
}
destination = Path(__file__).with_name("NeurIPS Add Event.unsigned.shortcut")
destination.write_bytes(plistlib.dumps(workflow, fmt=plistlib.FMT_BINARY))
print(f"Generated {destination} with {len(actions)} actions")
