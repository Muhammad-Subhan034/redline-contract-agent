"""
Trains Redline's clause-TYPE classifier (8 classes) — indemnification, limitation
of liability, termination, confidentiality, IP assignment, payment terms,
governing law, warranty disclaimer.

Same honest-eval architecture as Prospex's reply-intent classifier: synthetic
templates (both standard-ish and risky-ish phrasings per type, since type
classification must not depend on risk level), held out at the TEMPLATE level
so the eval measures genuine generalization. lib/classifier.ts reimplements the
TF-IDF + logistic regression inference in TypeScript from exported weights.
"""

import json
import random
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support

RNG_SEED = 11
MAX_FEATURES = 140

OUT_DIR = Path(__file__).resolve().parent.parent / "lib" / "model"
EVAL_OUT = Path(__file__).resolve().parent.parent / "data" / "eval-metrics.json"

CLAUSE_TEMPLATES = {
    "indemnification": [
        "Each party shall indemnify the other for third-party claims arising from its gross negligence.",
        "The Contractor agrees to indemnify and hold harmless the Client from any and all claims without limit.",
        "Indemnification obligations are capped at the total fees paid under this agreement.",
        "Vendor shall defend, indemnify, and hold Customer harmless against claims of IP infringement.",
        "Each party's indemnity obligation excludes claims arising from the other party's sole negligence.",
        "Supplier agrees to unlimited indemnification for any claim whatsoever related to the services.",
        "The indemnifying party shall reimburse reasonable attorneys' fees incurred in defending covered claims.",
        "Neither party has an indemnification obligation for consequential or indirect damages.",
        "Client shall indemnify Contractor for claims arising from Client-provided materials or specifications.",
        "This section survives termination and covers claims brought within two years of the breach.",
        "The indemnifying party controls the defense and settlement of any indemnified claim.",
        "Mutual indemnification applies equally to both parties under this section.",
    ],
    "limitation_of_liability": [
        "In no event shall either party's liability exceed the fees paid in the prior twelve months.",
        "Neither party shall be liable for any consequential, incidental, or punitive damages.",
        "There shall be no limitation on liability for breaches of confidentiality obligations.",
        "Total liability under this agreement shall not exceed the total contract value.",
        "The limitation of liability does not apply to claims arising from gross negligence.",
        "Liability is capped at two times the annual fees paid under this agreement.",
        "Each party's aggregate liability for direct damages is limited as set forth in this section.",
        "This limitation of liability applies regardless of the theory of liability asserted.",
        "Provider disclaims all liability for indirect or special damages arising from the services.",
        "The cap on liability does not apply to indemnification or IP infringement claims.",
        "Liability for data breaches is excluded from the general limitation of liability cap.",
        "In no circumstance will damages exceed amounts actually paid in the preceding six months.",
    ],
    "termination": [
        "Either party may terminate this agreement for convenience with sixty days' written notice.",
        "This agreement may be terminated immediately for uncured material breach after a cure period.",
        "Client may terminate this agreement at its sole discretion without cause or notice.",
        "Termination for cause requires thirty days' written notice and an opportunity to cure.",
        "Upon termination, all outstanding invoices become immediately due and payable.",
        "Either party may terminate if the other becomes insolvent or files for bankruptcy.",
        "This agreement automatically renews unless either party provides ninety days' notice.",
        "Provider may suspend or terminate services immediately for non-payment.",
        "Termination of this agreement does not relieve either party of accrued obligations.",
        "The non-breaching party may terminate this agreement upon a second material breach.",
        "Notice of termination must be delivered in writing to the address specified herein.",
        "Either party can end this agreement with thirty days' prior written notice for any reason.",
    ],
    "confidentiality": [
        "Confidential information must be protected using reasonable care for three years post-termination.",
        "Each party agrees not to disclose the other's confidential information to third parties.",
        "Confidentiality obligations survive termination of this agreement in perpetuity.",
        "Information independently developed without reference to confidential information is excluded.",
        "The receiving party may disclose confidential information as required by law or court order.",
        "Publicly available information is not considered confidential under this agreement.",
        "Each party shall use the same degree of care it uses to protect its own confidential data.",
        "Confidential information includes technical, financial, and business information disclosed in writing.",
        "The disclosing party retains all rights, title, and interest in its confidential information.",
        "Employees and contractors with access to confidential information must sign equivalent NDAs.",
        "Confidentiality obligations do not apply to information already known before disclosure.",
        "Upon request, all confidential materials must be returned or destroyed within thirty days.",
    ],
    "ip_assignment": [
        "Work product created under this agreement is assigned to the paying party upon full payment.",
        "Each party retains ownership of its pre-existing intellectual property and background IP.",
        "Contractor hereby assigns all right, title, and interest in the deliverables to Client.",
        "Any improvements to background IP made during the engagement remain with the original owner.",
        "Client is granted a perpetual, worldwide, royalty-free license to use the deliverables.",
        "All intellectual property, including pre-existing IP, is assigned to Client upon signing.",
        "Contractor grants Client a non-exclusive license to use tools embedded in the deliverables.",
        "Moral rights in the work product are waived to the extent permitted by applicable law.",
        "Ownership of jointly developed inventions shall be determined by inventorship under patent law.",
        "The assignment of IP rights is conditioned upon receipt of full and final payment.",
        "Client shall own all data generated through use of the platform during the term.",
        "Pre-existing tools and libraries used in the deliverables remain licensed, not assigned.",
    ],
    "payment_terms": [
        "Invoices are due net thirty days from the date of receipt.",
        "Late payments accrue interest at one and a half percent per month.",
        "Provider may suspend services if payment is more than fifteen days past due.",
        "All fees are non-refundable except as expressly stated in this agreement.",
        "Client shall reimburse reasonable travel expenses incurred in performing the services.",
        "Payment terms are net sixty days for invoices exceeding fifty thousand dollars.",
        "Any disputed charges must be raised in writing within thirty days of the invoice date.",
        "Fees are exclusive of applicable taxes, which shall be borne by Client.",
        "The total contract value shall not increase without a signed change order.",
        "Provider will invoice monthly in arrears for services actually performed.",
        "A deposit of twenty-five percent is due upon execution of this agreement.",
        "Failure to pay within the cure period entitles Provider to terminate for breach.",
    ],
    "governing_law": [
        "This agreement is governed by the laws of the state where the paying party is headquartered.",
        "The parties consent to exclusive jurisdiction in the courts of the governing state.",
        "Any dispute arising under this agreement shall be resolved through binding arbitration.",
        "This agreement shall be interpreted in accordance with the laws of Delaware.",
        "The parties waive any right to a jury trial in connection with this agreement.",
        "Venue for any legal proceeding shall lie exclusively in the county of the Client's headquarters.",
        "Disputes shall first be submitted to good-faith mediation before litigation may commence.",
        "This section survives termination and applies to all claims arising from this agreement.",
        "The prevailing party in any dispute is entitled to recover reasonable attorneys' fees.",
        "Choice of law provisions in this section do not apply to statutory consumer protections.",
        "The parties agree that New York law governs without regard to conflict of law principles.",
        "Arbitration shall be conducted under the rules of the American Arbitration Association.",
    ],
    "warranty_disclaimer": [
        "Services are warranted to be performed in a professional and workmanlike manner.",
        "All other warranties, express or implied, are disclaimed to the extent permitted by law.",
        "The software is provided as-is, without warranty of any kind whatsoever.",
        "Provider warrants that deliverables will conform to the specifications for ninety days.",
        "There is no warranty of merchantability or fitness for a particular purpose.",
        "Client's sole remedy for breach of warranty is re-performance of the nonconforming services.",
        "Provider disclaims all warranties not expressly set forth in this agreement.",
        "The warranty period begins upon acceptance of the deliverables by Client.",
        "Nothing in this section limits statutory warranties that cannot be disclaimed by law.",
        "Provider makes no warranty regarding third-party components incorporated into the deliverables.",
        "Any defects must be reported in writing within the warranty period to be covered.",
        "This warranty is void if the deliverables are modified without Provider's consent.",
    ],
}


def main():
    rng = random.Random(RNG_SEED)

    texts, labels, split = [], [], []
    for clause_type, templates in CLAUSE_TEMPLATES.items():
        shuffled = templates[:]
        rng.shuffle(shuffled)
        n_test = max(2, round(len(shuffled) * 0.3))
        test_templates = shuffled[:n_test]
        train_templates = shuffled[n_test:]

        # Templates are already full sentences (no {when}-style slots), so
        # "rendering" just means sampling with replacement to build up volume
        # while keeping the train/test template split strict.
        for _ in range(90):
            texts.append(rng.choice(train_templates))
            labels.append(clause_type)
            split.append("train")
        for _ in range(28):
            texts.append(rng.choice(test_templates))
            labels.append(clause_type)
            split.append("test")

    X_train_text = [t for t, s in zip(texts, split) if s == "train"]
    y_train = [l for l, s in zip(labels, split) if s == "train"]
    X_test_text = [t for t, s in zip(texts, split) if s == "test"]
    y_test = [l for l, s in zip(labels, split) if s == "test"]

    classes = list(CLAUSE_TEMPLATES.keys())

    vectorizer = TfidfVectorizer(
        max_features=MAX_FEATURES,
        ngram_range=(1, 1),
        lowercase=True,
        token_pattern=r"(?u)\b\w\w+\b",
        norm="l2",
        smooth_idf=True,
        stop_words="english",
    )
    X_train = vectorizer.fit_transform(X_train_text)
    X_test = vectorizer.transform(X_test_text)

    clf = LogisticRegression(max_iter=3000, C=2.0)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_test, y_pred, labels=classes, zero_division=0
    )
    cm = confusion_matrix(y_test, y_pred, labels=classes)
    accuracy = float((y_pred == np.array(y_test)).mean())

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    vocab = vectorizer.vocabulary_
    ordered_terms = sorted(vocab, key=lambda t: vocab[t])
    weights = {
        "vocabulary": ordered_terms,
        "idf": vectorizer.idf_.tolist(),
        "classes": list(clf.classes_),
        "weights": clf.coef_.tolist(),
        "bias": clf.intercept_.tolist(),
        "trainedOn": len(X_train_text),
        "seed": RNG_SEED,
    }
    (OUT_DIR / "weights.json").write_text(json.dumps(weights, indent=2))

    EVAL_OUT.parent.mkdir(parents=True, exist_ok=True)
    eval_report = {
        "accuracy": accuracy,
        "testSize": len(y_test),
        "trainSize": len(X_train_text),
        "classes": classes,
        "perClass": [
            {
                "label": classes[i],
                "precision": float(precision[i]),
                "recall": float(recall[i]),
                "f1": float(f1[i]),
                "support": int(support[i]),
            }
            for i in range(len(classes))
        ],
        "confusionMatrix": cm.tolist(),
    }
    EVAL_OUT.write_text(json.dumps(eval_report, indent=2))

    print(f"accuracy={accuracy:.4f}")
    print(f"vocab size={len(ordered_terms)}")


if __name__ == "__main__":
    main()
