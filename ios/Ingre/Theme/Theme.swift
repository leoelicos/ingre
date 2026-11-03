import SwiftUI
import UIKit

/// The web theme (client/src/styles/theme.css) in SwiftUI (#195). Neumorphic hierarchy: the
/// Recipes section is raised, its rows are recessed into it, and chips are raised again. No fills
/// or gradients: every surface is the page colour, and every level has an outline of at least
/// 3:1 against it, so depth never depends on the shadows alone.
enum Theme {
    static func dynamic(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(
            uiColor: UIColor { traits in
                let hex = traits.userInterfaceStyle == .dark ? dark : light
                return UIColor(
                    red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255,
                    blue: CGFloat(hex & 0xFF) / 255, alpha: 1
                )
            })
    }

    static let background = dynamic(0xFFF8F0, 0x141815)
    static let text = dynamic(0x2B2B2B, 0xF2EDE7)
    static let secondary = dynamic(0x6B6460, 0xBDB5AE)
    /// Outlines: stone on cream is 5.6:1, the dark border on night 4.9:1.
    static let border = dynamic(0x6B6460, 0x8A827C)
    static let primary = dynamic(0x2F7D4F, 0x74C995)
    static let allergen = dynamic(0xB45309, 0xF5B041)
    static let shadowDark = dynamic(0x2B2B2B, 0x000000)
    static let shadowLight = dynamic(0xFFFFFF, 0xFFFFFF)

    /// Section inks (#154): text and outline colour per shop section, at least 6.7:1 on cream.
    static func ink(_ tone: SectionTone) -> Color {
        switch tone {
        case .produce: dynamic(0x1F5A36, 0xA6E0BB)
        case .meat: dynamic(0x8A2318, 0xFFC2B8)
        case .dairy: dynamic(0x1D4F8A, 0xB5D3F7)
        case .deli: dynamic(0x7A3A0B, 0xF8C9A3)
        case .bakery: dynamic(0x674708, 0xF0D999)
        case .pantry: dynamic(0x5B2F7A, 0xDCC3F2)
        case .frozen: dynamic(0x0B5864, 0xA3E3EE)
        case .neutral: dynamic(0x4A4542, 0xDCD7D3)
        }
    }

    static let cardRadius: CGFloat = 12
    static let controlRadius: CGFloat = 8
    /// 44 pt touch targets (#195).
    static let minTarget: CGFloat = 44
}

/// The three depths of the hierarchy, after --shadow-section, --shadow-recessed and --shadow-chip.
enum Depth {
    case section
    case raised
    case recessed
    case chip
    case pressedChip

    var offset: CGFloat {
        switch self {
        case .section: 8
        case .raised: 5
        case .recessed: 3
        case .chip, .pressedChip: 2
        }
    }

    var blur: CGFloat {
        switch self {
        case .section: 10
        case .raised: 6
        case .recessed: 3
        case .chip, .pressedChip: 2
        }
    }

    var inset: Bool { self == .recessed || self == .pressedChip }
}

struct NeumorphicSurface<S: InsettableShape>: ViewModifier {
    let shape: S
    let depth: Depth
    var outline: Color = Theme.border

    func body(content: Content) -> some View {
        content.background {
            ZStack {
                if depth.inset {
                    // An inner shadow: the page colour, darkened top-left and lit bottom-right.
                    shape.fill(
                        Theme.background
                            .shadow(
                                .inner(
                                    color: Theme.shadowDark.opacity(0.18), radius: depth.blur, x: depth.offset,
                                    y: depth.offset)
                            )
                            .shadow(
                                .inner(
                                    color: Theme.shadowLight.opacity(0.85), radius: depth.blur, x: -depth.offset,
                                    y: -depth.offset))
                    )
                } else {
                    shape.fill(Theme.background)
                        .shadow(
                            color: Theme.shadowDark.opacity(0.16), radius: depth.blur, x: depth.offset, y: depth.offset
                        )
                        .shadow(
                            color: Theme.shadowLight.opacity(0.9), radius: depth.blur, x: -depth.offset,
                            y: -depth.offset)
                }
                shape.strokeBorder(outline, lineWidth: 1)
            }
        }
    }
}

extension View {
    func surface(_ depth: Depth, radius: CGFloat = Theme.cardRadius, outline: Color = Theme.border) -> some View {
        modifier(
            NeumorphicSurface(
                shape: RoundedRectangle(cornerRadius: radius, style: .continuous), depth: depth, outline: outline))
    }

    func chipSurface(_ depth: Depth, outline: Color) -> some View {
        modifier(NeumorphicSurface(shape: Capsule(style: .continuous), depth: depth, outline: outline))
    }

    /// At least 44 × 44 pt to tap.
    func touchTarget() -> some View {
        frame(minWidth: Theme.minTarget, minHeight: Theme.minTarget).contentShape(Rectangle())
    }
}

/// Animations that turn off with Reduce Motion.
struct MotionAware {
    let reduceMotion: Bool

    func run(_ change: () -> Void) {
        if reduceMotion {
            change()
        } else {
            withAnimation(.easeInOut(duration: 0.2), change)
        }
    }
}

/// A plain button with no tint fill, just the page colour and the ink.
struct InkButtonStyle: ButtonStyle {
    var depth: Depth = .raised

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(Theme.text)
            .padding(.horizontal, 16)
            .touchTarget()
            .surface(configuration.isPressed ? .recessed : depth, radius: Theme.controlRadius)
    }
}
