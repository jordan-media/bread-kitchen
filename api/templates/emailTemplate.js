// templates/emailTemplate.js
// Generates bulletproof HTML email that works across all email clients

function generateEmailHTML(campaign, items, unsubscribeUrl) {
    // Colors from the bakery palette
    const colors = {
        cream: '#FEFBE3',
        beige: '#EFE3C3',
        sage: '#CFD8B3',
        caramel: '#C58E56',
        darkBrown: '#5a4a32',
        mediumBrown: '#8B5A2B'
    };

    // Generate bread items HTML
    const itemsHTML = items.map(item => `
        <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid ${colors.sage};">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td width="120" valign="top" style="padding-right: 16px;">
                            <img
                                src="${item.image_url}"
                                alt="${item.name_en}"
                                width="120"
                                height="120"
                                style="display: block; border-radius: 4px; object-fit: cover;"
                            />
                        </td>
                        <td valign="top" style="font-family: Arial, sans-serif;">
                            <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: ${colors.darkBrown};">
                                ${item.name_en}
                            </p>
                            <p style="margin: 0 0 8px 0; font-size: 16px; color: ${colors.caramel};">
                                ${item.name_ja}
                            </p>
                            <p style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold; color: ${colors.darkBrown};">
                                ¥${item.price}
                            </p>
                            ${item.description_en ? `
                                <p style="margin: 0; font-size: 14px; color: ${colors.mediumBrown}; line-height: 1.4;">
                                    ${item.description_en}
                                </p>
                            ` : ''}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaign.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.cream}; font-family: Arial, sans-serif;">

    <!-- Wrapper Table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.cream};">
        <tr>
            <td align="center" style="padding: 20px;">

                <!-- Main Container - 600px max -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color: ${colors.beige}; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0 0 8px 0; font-size: 28px; color: ${colors.darkBrown}; font-family: Georgia, serif;">
                                Bread Kitchen
                            </h1>
                            <p style="margin: 0; font-size: 20px; color: ${colors.caramel}; font-family: Georgia, serif;">
                                焼きたてパン
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 32px 24px;">

                            <!-- Intro -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding-bottom: 24px; border-bottom: 2px solid ${colors.sage};">
                                        <h2 style="margin: 0 0 16px 0; font-size: 22px; color: ${colors.darkBrown}; font-family: Arial, sans-serif;">
                                            Fresh Bread This Week!
                                        </h2>
                                        ${campaign.intro_text ? `
                                            <p style="margin: 0 0 16px 0; font-size: 16px; color: ${colors.mediumBrown}; line-height: 1.5;">
                                                ${campaign.intro_text}
                                            </p>
                                        ` : ''}
                                        <table cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.beige}; border-radius: 4px;">
                                            <tr>
                                                <td style="padding: 12px 16px;">
                                                    <p style="margin: 0; font-size: 15px; color: ${colors.darkBrown};">
                                                        <strong>Pickup:</strong> ${campaign.pickup_date} &nbsp;|&nbsp; ${campaign.pickup_time}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Bread Items -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                                ${itemsHTML}
                            </table>

                            <!-- Call to Action -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px;">
                                <tr>
                                    <td style="background-color: ${colors.sage}; padding: 24px; border-radius: 8px; text-align: center;">
                                        <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: ${colors.darkBrown};">
                                            Want to reserve?
                                        </p>
                                        <p style="margin: 0; font-size: 15px; color: ${colors.darkBrown};">
                                            Simply reply to this email with your order!<br>
                                            Or message us on LINE: <strong>@breadkitchen</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Pickup Location -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                                <tr>
                                    <td style="background-color: ${colors.beige}; padding: 24px; border-radius: 8px; text-align: center;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${colors.mediumBrown};">
                                            Pickup Location
                                        </p>
                                        <p style="margin: 0 0 16px 0; font-size: 22px; font-weight: bold; color: ${colors.darkBrown}; font-family: Georgia, serif;">
                                            Bread Kitchen
                                        </p>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; color: ${colors.darkBrown}; line-height: 1.5;">
                                            123 Bakery Street<br>
                                            Shibuya-ku, Tokyo 150-0001
                                        </p>
                                        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="background-color: ${colors.caramel}; border-radius: 4px;">
                                                    <a href="https://maps.google.com/?q=123+Bakery+Street+Shibuya+Tokyo"
                                                       style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">
                                                        Open in Google Maps
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: ${colors.beige}; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: ${colors.darkBrown}; font-weight: bold;">
                                Bread Kitchen
                            </p>
                            <p style="margin: 0 0 16px 0; font-size: 13px; color: ${colors.mediumBrown}; line-height: 1.4;">
                                123 Bakery Street, Shibuya-ku, Tokyo<br>
                                breadkitchen@gmail.com
                            </p>
                            <p style="margin: 0; font-size: 12px; color: ${colors.mediumBrown};">
                                <a href="${unsubscribeUrl}" style="color: ${colors.mediumBrown}; text-decoration: underline;">
                                    Unsubscribe
                                </a>
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
    `.trim();
}

// Generate plain text version (for email clients that don't support HTML)
function generatePlainText(campaign, items, unsubscribeUrl) {
    const itemsText = items.map(item =>
        `${item.name_en} (${item.name_ja}) - ¥${item.price}`
    ).join('\n');

    return `
BREAD KITCHEN - 焼きたてパン

Fresh Bread This Week!

${campaign.intro_text || ''}

Pickup: ${campaign.pickup_date} | ${campaign.pickup_time}

---

${itemsText}

---

Want to reserve? Reply to this email or message us on LINE: @breadkitchen

---

PICKUP LOCATION
Bread Kitchen
123 Bakery Street
Shibuya-ku, Tokyo 150-0001

Google Maps: https://maps.google.com/?q=123+Bakery+Street+Shibuya+Tokyo

---

Unsubscribe: ${unsubscribeUrl}
    `.trim();
}

module.exports = { generateEmailHTML, generatePlainText };
